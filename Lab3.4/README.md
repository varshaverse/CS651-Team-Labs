# Lab 3.4: Deploy the Backend and Frontend to AWS

## Project details
- AWS region: `us-east-1` (US East, N. Virginia)
- Elastic Beanstalk application: `smartspeech-backend`
- Elastic Beanstalk environment: `Smartspeech-backend-env-1`
- Platform: Node.js 24 on 64bit Amazon Linux 2023
- Backend URL: `http://smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com`
- S3 bucket (frontend): `smartspeech-frontend`
- Frontend URL: `http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com`
- Model: `gemini-3.5-flash-lite`

**Live frontend URL:** `http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com`

This document explains how the Lab 3.3 backend was deployed to AWS Elastic Beanstalk and how the frontend was deployed to Amazon S3. The backend runs on Elastic Beanstalk, and the frontend runs as a static website on S3 and calls the backend with `fetch`.

## 1. Project structure

```text
Lab3.4/
├── frontend/
└── backend/
    ├── server.js
    ├── package.json
    └── package-lock.json
```

The Elastic Beanstalk ZIP is created from the `backend` folder. Its `package.json` and `server.js` must be at the top level of the ZIP.

## 2. Frontend configuration

The frontend reads the backend URL from `frontend/.env`:

```text
VITE_SERVER_REMOTE=Y
VITE_SERVER_URL_REMOTE=http://smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com
VITE_SERVER_URL_LOCAL=http://localhost:3001
```

`VITE_SERVER_REMOTE=Y` selects the remote URL. `App.jsx` sends the request to `${serverUrl}/api/askanything`.

Restart the frontend after changing `.env`:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, submit a question, and confirm in DevTools → Network that the POST goes to the Elastic Beanstalk URL and returns 200.

## 3. Create the deployment ZIP

From inside the `backend` folder, so the files sit at the top level:

```bash
cd backend
npm install
rm -f ../smartspeech-backend.zip
zip -r ../smartspeech-backend.zip server.js package.json package-lock.json
unzip -l ../smartspeech-backend.zip
```

The listing must show `package.json` and `server.js` with no folder name in front of them. A path such as `backend/package.json` causes the deployment error described in Section 9. Do not include `.env` files or `node_modules`.

Also confirm `server.js` has only one CORS block:

```bash
unzip -p ../smartspeech-backend.zip server.js | grep -n "app.use(cors"
```

The output must show one line.

## 4. Create the Elastic Beanstalk application and environment

Region: **US East (N. Virginia), `us-east-1`**

1. Open **Elastic Beanstalk → Create application**.
   - Application name: `smartspeech-backend`
2. Inside the application, click **Create environment**.
   - Environment tier: **Web server environment**
   - Environment name: `Smartspeech-backend-env-1`
   - Platform: **Node.js**, Node.js 24 running on 64bit Amazon Linux 2023
   - Application code: **Upload your code**, then upload `smartspeech-backend.zip` with version label `v1`
   - Capacity: **Single instance**
3. Under **Environment properties**, add:

   | Name | Value |
   |---|---|
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `geminiAskAnythingModel` | `gemini-3.5-flash-lite` |
   | `allowedOrigins` | `http://localhost:5173,http://127.0.0.1:5173,http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com` |
   | `askAnythingPrompt` | The Ask Anything prompt text, without the outer quotes |

   Do not add `PORT`. Elastic Beanstalk sets it automatically.

4. Under **Service access**, choose **Use another role**:
   - Service role: `LabRole`
   - EC2 instance profile: `LabInstanceProfile`

5. Click **Create**, then wait until the Events tab shows "Environment successfully launched" and the health shows **Ok**.

## 5. Test the backend

```bash
curl -i http://smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com/api/health

curl -i -X OPTIONS \
  -H "Origin: http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST" \
  http://smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com/api/askanything

curl -i --max-time 60 -X POST \
  http://smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com/api/askanything \
  -H "Content-Type: application/json" \
  -H "Origin: http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com" \
  -d '{"message":"What is Smart Speech Coach?"}'
```

- `/api/health` returns `HTTP/1.1 200 OK` with `{"status":"ok"}`.
- The OPTIONS request returns `Access-Control-Allow-Origin: http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com`.
- `/api/askanything` returns `HTTP/1.1 200 OK` with an `answer` field and the same `Access-Control-Allow-Origin` header.

##
