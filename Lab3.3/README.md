# CS651-Team-Labs
# Deployment Steps: SmartSpeechCoach to Google Cloud Run (Backend and Frontend)

## Project details
- Google Cloud project: `group3-smartspeech-2026`
- Region: `us-west1`
- Model: `gemini-3.5-flash-lite`
- Backend Cloud Run service: `smartspeechcoach-backend`
- Backend URL: `https://smartspeechcoach-backend-693288299900.us-west1.run.app`
- Frontend Cloud Run service: `smartspeechcoach-frontend`
- Frontend URL: `https://smartspeechcoach-frontend-693288299900.us-west1.run.app`

## 1. Set up Google Cloud
```bash
gcloud auth login
gcloud projects create group3-smartspeech-2026 --name="SmartSpeechCoach"
gcloud config set project group3-smartspeech-2026
gcloud billing accounts list
gcloud billing projects link group3-smartspeech-2026 --billing-account=BILLING_ACCOUNT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com generativelanguage.googleapis.com
```
Skip `projects create` if the project already exists.

## 2. Configure the backend
Create `backend/.env.cloudrun`. Every line must use `NAME: "value"` (YAML format):

```yaml
GEMINI_API_KEY: "YOUR_GEMINI_API_KEY"
geminiAskAnythingModel: "gemini-3.5-flash-lite"
askAnythingPrompt: "You are going to answer questions about Smart Speech Coach..."
allowedOrigins: "http://localhost:5173,http://127.0.0.1:5173,https://smartspeechcoach.web.app,https://smartspeechcoach-frontend-693288299900.us-west1.run.app"
```

The key is stored only in this file. `.env.cloudrun` is git-ignored and must never be committed.

## 3. Deploy the backend
From the `backend` folder:
```bash
cd backend
gcloud run deploy smartspeechcoach-backend \
  --source . \
  --region us-west1 \
  --allow-unauthenticated \
  --env-vars-file .env.cloudrun
```

Make sure `backend/server.js` has only one `app.use(cors(` block, and that it uses `origin: allowedOrigins`:
```bash
grep -n "app.use(cors" server.js
```

## 4. Test the backend
```bash
curl https://smartspeechcoach-backend-693288299900.us-west1.run.app/api/health

curl -i -X OPTIONS \
  -H "Origin: https://smartspeechcoach-frontend-693288299900.us-west1.run.app" \
  -H "Access-Control-Request-Method: POST" \
  https://smartspeechcoach-backend-693288299900.us-west1.run.app/api/askanything

curl -i --max-time 60 -X POST https://smartspeechcoach-backend-693288299900.us-west1.run.app/api/askanything \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Smart Speech Coach?"}'
```
- `/api/health` returns `{"status":"ok"}`.
- The OPTIONS request returns `Access-Control-Allow-Origin: https://smartspeechcoach-frontend-693288299900.us-west1.run.app`.
- `/api/askanything` returns `{"answer":"..."}`.

## 5. Deploy the frontend to Cloud Run

The frontend is a Vite app. It's built into static files and served by a small Express server in a container.

### 5.1 Add the web server
From the `frontend` folder:
```bash
cd frontend
npm install express
```

Create `frontend/serve.js`:
```js
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend running on port ${port}`);
});
```

Confirm `frontend/package.json` contains `"type": "module"` and `"express"` under `dependencies`.

### 5.2 Create the Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:24-alpine

WORKDIR /app

ENV VITE_SERVER_REMOTE=Y
ENV VITE_SERVER_URL_REMOTE=https://smartspeechcoach-backend-693288299900.us-west1.run.app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
CMD ["node", "serve.js"]
```

### 5.3 Create the .dockerignore file
Create `frontend/.dockerignore`:
```text
node_modules
dist
.env
.env.*
```

### 5.4 Deploy
```bash
cd frontend
gcloud run deploy smartspeechcoach-frontend \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

Frontend URL: `https://smartspeechcoach-frontend-693288299900.us-west1.run.app`

### 5.5 Allow the frontend on the backend
The backend's `allowedOrigins` environment variable must include the frontend URL. Set it on the Cloud Run service (this overrides the default list in `server.js`):
```bash
gcloud run services update smartspeechcoach-backend \
  --region us-west1 \
  --update-env-vars "^@^allowedOrigins=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,https://smartspeechcoach.web.app,https://smartspeechcoach-frontend-693288299900.us-west1.run.app"
```

Also keep `.env.cloudrun` in sync with this value. Otherwise a later `--env-vars-file` deploy resets it.

Confirm the header:
```bash
curl -i -X OPTIONS \
  -H "Origin: https://smartspeechcoach-frontend-693288299900.us-west1.run.app" \
  -H "Access-Control-Request-Method: POST" \
  https://smartspeechcoach-backend-693288299900.us-west1.run.app/api/askanything
```
The output must include `access-control-allow-origin: https://smartspeechcoach-frontend-693288299900.us-west1.run.app`.

## 6. Run the frontend locally (optional)
Create `frontend/.env`:
```
VITE_SERVER_REMOTE=Y
VITE_SERVER_URL_REMOTE=https://smartspeechcoach-backend-693288299900.us-west1.run.app
VITE_SERVER_URL_LOCAL=http://localhost:3001
```

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`, submit a question, and confirm in DevTools → Network that the request goes to the Cloud Run backend and returns 200.

## 7. Test the deployed app
1. Open `https://smartspeechcoach-frontend-693288299900.us-west1.run.app`.
2. Hard-refresh with **Cmd + Shift + R**.
3. Send a question. The answer should appear.
4. In DevTools → Network, the `askanything` request should go to `https://smartspeechcoach-backend-693288299900.us-west1.run.app` and return 200.

## 8. View logs
```bash
gcloud run services logs read smartspeechcoach-backend --region us-west1 --limit 50
gcloud run services logs read smartspeechcoach-frontend --region us-west1 --limit 50
```
Or open the Cloud Run console, select the service, then the **Logs** tab.

## 9. Redeploy after changes
- **Backend:** run the deploy command from step 3.
- **Frontend:** rebuild happens inside the container, so run the command from step 5.4 again. If the backend URL changes, update the `VITE_SERVER_URL_REMOTE` line in the Dockerfile first.

## Troubleshooting
- **Build fails at `npm ci`:** `package-lock.json` is out of sync with `package.json`. The Dockerfile uses `npm install` to avoid this.
- **Build fails with "unknown instruction":** a Dockerfile line is missing its `RUN`, `ENV`, or `COPY` keyword, or has a typo. Dockerfile comments start with `#`, not `//`.
- **Container failed to start on port 8080:** check the logs. `Cannot find package 'express'` means `express` isn't in `package.json`. Run `npm install express` in the `frontend` folder and deploy again.
- **500 error, "could not answer right now":** check the logs for `Gemini request failed:`. A `not_found` error means the model name is wrong. A 401 means the key is invalid.
- **CORS error in the browser:** the backend's `allowedOrigins` environment variable is missing the frontend URL. Update it with step 5.5. A code change in `server.js` alone doesn't take effect while that variable is set.
- **Invalid YAML when deploying:** every line in `.env.cloudrun` must use `NAME: "value"`, not `NAME=value`.
