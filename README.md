# CableSync

CableSync is a single-backend, multi-portal billing system for cable operators. The backend runs on Render and connects to MongoDB Atlas, while the operator and subscriber apps are separate Vercel projects with independent root directories.

## Architecture

```text
MongoDB Atlas
    ↓
Render backend (single API)
    ├── /customers
    ├── /payments
    ├── /reports
    ├── /operator
    ├── /customer-api
    └── /api/...
    ├── operator-portal (Vercel)
    └── subscriber-portal (Vercel)
```

## Production-ready backend

- One backend service only.
- Operator login is separate from customer login.
- Subscriber access requires a real phone + CAF match before issuing a customer JWT.
- No OTP-based demo login remains in production code.
- Customer-specific data is only returned for the authenticated subscriber.

## Project layout

```text
CableSync/
├── backend/
├── operator-portal/
├── subscriber-portal/
├── render.yaml
├── package.json
├── README.md
└── .gitignore
```

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend defaults:
- `http://localhost:5000`
- `JWT_SECRET` should be set in the backend environment

### Operator portal

```bash
cd operator-portal
npm install
cp .env.example .env
npm run dev
```

### Subscriber portal

```bash
cd subscriber-portal
npm install
cp .env.example .env
npm run dev
```

## Production environment values

### Render backend

Set these in Render:

```text
NODE_ENV=production
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<strong random secret, 32+ chars>
FRONTEND_ORIGIN=https://cablesync-operator.vercel.app,https://cablesync-subscriber.vercel.app
```

### Vercel operator portal

Root Directory: `operator-portal`

```text
VITE_API_URL=https://cablesync-h7r0.onrender.com
```

### Vercel subscriber portal

Root Directory: `subscriber-portal`

```text
VITE_API_URL=https://cablesync-h7r0.onrender.com
```

## Render deployment

The repository is configured with `render.yaml` for a single backend service. Use the Render web service with root directory `backend` and confirm the health endpoint is live:

```text
https://<your-render-service>.onrender.com/health
```

Expected response:

```json
{ "status": "ok" }
```

## Vercel deployment

Create two projects from the same repo:

1. `cablesync-operator` with Root Directory `operator-portal`
2. `cablesync-subscriber` with Root Directory `subscriber-portal`

Both use the same backend URL:

```text
https://cablesync-h7r0.onrender.com
```

## Security notes

- OTP-based customer login has been removed for production deployment.
- Subscriber authentication uses a verified phone + CAF match before issuing a JWT.
- Customer APIs must be used with the signed customer token only.
- Operator/admin APIs remain separate from subscriber APIs.

## Verify locally

```bash
cd backend
npm run test:billing

cd ../operator-portal
npm run build

cd ../subscriber-portal
npm run build
```
