# CS651-Team-Labs
# Deployment Steps: SmartSpeechCoach Backend to Google Cloud Run

## Project details
- Google Cloud project: `group3-smartspeech-2026`
- Region: `us-west1`
- Cloud Run service: `smartspeechcoach-backend`
- Model: `gemini-3.5-flash-lite`
- Service URL: `https://smartspeechcoach-backend-693288299900.us-west1.run.app`

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
Create `backend/.env.cloudrun` from the template in YAML format. Every line must use `NAME: "value"`:

```yaml
GEMINI_API_KEY: "YOUR_GEMINI_API_KEY"
geminiAskAnythingModel: "gemini-3.5-flash-lite"
askAnythingPrompt: "You are going to answer questions about Smart Speech Coach..."
allowedOrigins: "http://localhost:5173,http://127.0.0.1:5173,https://smartspeechcoach.web.app"
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
When it finishes, copy the Service URL it prints.

## 4. Test the backend
```bash
curl https://smartspeechcoach-backend-693288299900.us-west1.run.app/api/health

curl -i --max-time 60 -X POST https://smartspeechcoach-backend-693288299900.us-west1.run.app/api/askanything \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Smart Speech Coach?"}'
```
- `/api/health` returns `{"status":"ok"}`.
- `/api/askanything` returns `{"answer":"..."}`.

## 5. Connect the frontend
Create `frontend/.env`:
```
VITE_SERVER_REMOTE=Y
VITE_SERVER_URL_REMOTE=https://smartspeechcoach-backend-693288299900.us-west1.run.app
VITE_SERVER_URL_LOCAL=http://localhost:3001
```

Run the frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`, submit a question, and confirm the request in DevTools → Network goes to the Cloud Run URL and returns 200.

## 6. View logs
```bash
gcloud run services logs read smartspeechcoach-backend --region us-west1 --limit 50
```
Or open the Cloud Run console, select `smartspeechcoach-backend`, then the **Logs** tab.

## 7. Redeploy after changes
Run the deploy command from step 3 again.

## Troubleshooting
- **500 error, "could not answer right now":** check the logs for `Gemini request failed:`. A `not_found` error means the model name is wrong. A 401 means the key is invalid.
- **CORS error in the browser:** add your frontend origin to `allowedOrigins` in `.env.cloudrun` and redeploy.
- **Invalid YAML when deploying:** every line in `.env.cloudrun` must use `NAME: "value"`, not `NAME=value`.
