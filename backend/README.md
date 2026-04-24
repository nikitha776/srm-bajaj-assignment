# Backend

Express API for the SRM assignment.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Environment

Fill these with your real details:

- `PORT`
- `FULL_NAME`
- `DOB_DDMMYYYY`
- `EMAIL_ID`
- `COLLEGE_ROLL_NUMBER`

## API

### `POST /bfhl`

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```
