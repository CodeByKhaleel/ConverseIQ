# ConverseIQ

Starter scaffold for the ConverseIQ platform featuring a Node.js/Express backend and a static frontend playground.

## Project Structure

```
ConverseIQ/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── db/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   ├── .env (ignored)
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── README.md
└── .gitignore
```

## Getting Started

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
2. **Frontend**
   Serve the static files in `frontend/` using your preferred tool (e.g. `npx serve frontend`).

## Environment Variables

`backend/.env` should define at least:

```
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/converseiq
```

Never commit your real `.env` file—use `.env.example` as a guide.
