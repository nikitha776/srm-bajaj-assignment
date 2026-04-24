const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

function createNodeState() {
  return {
    children: [],
    childSet: new Set(),
    parents: new Set(),
  };
}

function ensureNode(store, node) {
  if (!store.has(node)) {
    store.set(node, createNodeState());
  }

  return store.get(node);
}

function buildNestedTree(adjacency, node) {
  const children = adjacency.get(node) ?? [];
  const subtree = {};

  for (const child of children) {
    subtree[child] = buildNestedTree(adjacency, child);
  }

  return subtree;
}

function computeDepth(adjacency, node) {
  const children = adjacency.get(node) ?? [];

  if (children.length === 0) {
    return 1;
  }

  return 1 + Math.max(...children.map((child) => computeDepth(adjacency, child)));
}

function collectComponent(start, undirected) {
  const visited = new Set([start]);
  const stack = [start];

  while (stack.length > 0) {
    const current = stack.pop();

    for (const next of undirected.get(current) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        stack.push(next);
      }
    }
  }

  return [...visited];
}

function hasCycleInComponent(nodes, adjacency) {
  const nodeSet = new Set(nodes);
  const visiting = new Set();
  const visited = new Set();

  function dfs(node) {
    if (visiting.has(node)) {
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visiting.add(node);

    for (const child of adjacency.get(node) ?? []) {
      if (nodeSet.has(child) && dfs(child)) {
        return true;
      }
    }

    visiting.delete(node);
    visited.add(node);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node)) {
      return true;
    }
  }

  return false;
}

function pickRoot(componentNodes, parentLookup) {
  const roots = componentNodes.filter((node) => (parentLookup.get(node) ?? []).length === 0);

  if (roots.length > 0) {
    return roots.sort()[0];
  }

  return [...componentNodes].sort()[0];
}

export function processHierarchyEntries(rawEntries) {
  const invalidEntries = [];
  const duplicateEdges = [];
  const duplicateSet = new Set();
  const seenValidEdges = new Set();
  const acceptedEdges = [];
  const nodes = new Map();

  for (const rawEntry of rawEntries) {
    const entry = String(rawEntry ?? "").trim();

    if (!EDGE_PATTERN.test(entry)) {
      invalidEntries.push(String(rawEntry ?? ""));
      continue;
    }

    const [parent, child] = entry.split("->");
    const canonicalEdge = `${parent}->${child}`;

    if (parent === child) {
      invalidEntries.push(String(rawEntry ?? ""));
      continue;
    }

    if (seenValidEdges.has(canonicalEdge)) {
      if (!duplicateSet.has(canonicalEdge)) {
        duplicateSet.add(canonicalEdge);
        duplicateEdges.push(canonicalEdge);
      }

      continue;
    }

    seenValidEdges.add(canonicalEdge);

    const childState = nodes.get(child);

    if (childState && childState.parents.size > 0) {
      continue;
    }

    const parentState = ensureNode(nodes, parent);
    const acceptedChildState = ensureNode(nodes, child);

    parentState.childSet.add(child);
    parentState.children.push(child);
    acceptedChildState.parents.add(parent);
    acceptedEdges.push([parent, child]);
  }

  const adjacency = new Map();
  const parentLookup = new Map();
  const undirected = new Map();

  for (const [node, state] of nodes) {
    adjacency.set(node, [...state.children]);
    parentLookup.set(node, [...state.parents]);
    undirected.set(node, new Set());
  }

  for (const [parent, child] of acceptedEdges) {
    undirected.get(parent).add(child);
    undirected.get(child).add(parent);
  }

  const seen = new Set();
  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = "";
  let largestTreeDepth = 0;

  for (const node of nodes.keys()) {
    if (seen.has(node)) {
      continue;
    }

    const componentNodes = collectComponent(node, undirected);

    for (const componentNode of componentNodes) {
      seen.add(componentNode);
    }

    const root = pickRoot(componentNodes, parentLookup);
    const cyclic = hasCycleInComponent(componentNodes, adjacency);

    if (cyclic) {
      totalCycles += 1;
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      continue;
    }

    const tree = {
      [root]: buildNestedTree(adjacency, root),
    };
    const depth = computeDepth(adjacency, root);

    totalTrees += 1;

    if (
      depth > largestTreeDepth ||
      (depth === largestTreeDepth && (largestTreeRoot === "" || root < largestTreeRoot))
    ) {
      largestTreeDepth = depth;
      largestTreeRoot = root;
    }

    hierarchies.push({
      root,
      tree,
      depth,
    });
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}
