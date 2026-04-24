import { useState } from "react";

const SAMPLE_INPUT = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->
C->D
E->D`;

const DEFAULT_API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function formatEntries(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function JsonBlock({ title, value, emptyText = "None" }) {
  const isEmptyArray = Array.isArray(value) && value.length === 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
        {isEmptyArray ? emptyText : JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

function DetailsTable({ result }) {
  const rows = [
    ["User ID", result.user_id],
    ["Email", result.email_id],
    ["Roll Number", result.college_roll_number],
    ["Total Trees", result.summary.total_trees],
    ["Total Cycles", result.summary.total_cycles],
    ["Largest Tree Root", result.summary.largest_tree_root || "-"],
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Response Details</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-slate-200 last:border-b-0">
                <th className="w-52 bg-slate-50 px-4 py-3 text-left font-medium text-slate-700">
                  {label}
                </th>
                <td className="px-4 py-3 text-slate-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HierarchiesTable({ hierarchies }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Hierarchies</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-medium text-slate-700">Root</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Type</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Depth</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Immediate Children
              </th>
            </tr>
          </thead>
          <tbody>
            {hierarchies.map((hierarchy) => {
              const rootNode = Object.keys(hierarchy.tree ?? {})[0] ?? hierarchy.root;
              const directChildren = hierarchy.has_cycle
                ? []
                : Object.keys(hierarchy.tree?.[rootNode] ?? {});

              return (
                <tr
                  key={`${hierarchy.root}-${hierarchy.has_cycle ? "cycle" : "tree"}`}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <td className="px-4 py-3 text-slate-900">{hierarchy.root}</td>
                  <td className="px-4 py-3 text-slate-900">
                    {hierarchy.has_cycle ? "Cycle" : "Tree"}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {hierarchy.has_cycle ? "-" : hierarchy.depth}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {hierarchy.has_cycle
                      ? "-"
                      : directChildren.length > 0
                        ? directChildren.join(", ")
                        : "None"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function App() {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${DEFAULT_API_BASE.replace(/\/$/, "")}/bfhl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: formatEntries(input),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "API request failed.");
      }

      setResult(payload);
    } catch (submitError) {
      setResult(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while calling the API.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            SRM Full Stack Engineering Challenge
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            BFHL Assignment Demo
          </h1>
          <p className="mt-3 text-sm text-slate-700">
            Frontend is currently using:
            <span className="ml-2 rounded bg-slate-100 px-2 py-1 font-mono text-xs">
              {DEFAULT_API_BASE}/bfhl
            </span>
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Input for evaluation
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-900">
                  Node entries
                </span>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={16}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm shadow-sm outline-none transition focus:border-slate-400"
                  placeholder="One edge per line, for example A->B"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isSubmitting ? "Submitting..." : "Submit to API"}
              </button>
            </form>
            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {result && (
              <>
                <DetailsTable result={result} />
                <HierarchiesTable hierarchies={result.hierarchies} />

                <section className="grid gap-4 xl:grid-cols-2">
                  <JsonBlock title="Invalid Entries" value={result.invalid_entries} />
                  <JsonBlock title="Duplicate Edges" value={result.duplicate_edges} />
                </section>

                <JsonBlock title="Raw API Response" value={result} />
              </>
            )}

            {!result && (
              <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Submit the sample once to see the assignment output sections.
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
