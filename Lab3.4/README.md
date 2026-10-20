# Lab 3.4: Deploy the Backend to AWS Elastic Beanstalk

This document explains how the Lab 3.3 backend was deployed to AWS Elastic Beanstalk. The frontend runs locally and calls the deployed backend with `fetch`.

## 1. Project structure

```text
Lab3.4/
├── frontend/
└── backend/
```

The Elastic Beanstalk ZIP is created from the `backend` folder. Its `package.json` and `server.js` must be at the top level of the ZIP.

## 2. Frontend configuration

The frontend reads the backend URL from `frontend/.env`:

```text
VITE_SERVER_REMOTE=Y
VITE_SERVER_URL_REMOTE=http:http://smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com
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

From inside the `backend` folder:

```bash
cd backend
zip -r ../backend.zip . -x "node_modules/*" ".env*"
unzip -l ../backend.zip | grep -E "package.json|server.js"
```

The listing must show `package.json` and `server.js` with no folder name in front of them. A path such as `backend/package.json` causes the deployment error described in Section 8.

## 4. Create the Elastic Beanstalk application and environment

Region: **US East (N. Virginia), `us-east-1`**

1. Open **Elastic Beanstalk → Create application**.
   - Application name: `Smartspeech-backend`
2. Inside the application, click **Create environment**.
   - Environment tier: **Web server environment**
   - Environment name: `Smartspeech-backend-env-1`
   - Platform: **Node.js**, Node.js 24 running on 64bit Amazon Linux 2023
   - Application code: **Local file**, then upload `backend.zip`
   - Capacity: **Single instance**
3. Under **Environment properties**, add:

   | Name | Value |
   |---|---|
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `geminiAskAnythingModel` | `gemini-3.5-flash-lite` |
   | `allowedOrigins` | `http://localhost:5173,http://127.0.0.1:5173,https://smartspeechcoach.web.app` |
   | `askAnythingPrompt` | The Ask Anything prompt text, without the outer quotes |

   Do not add `PORT`. Elastic Beanstalk sets it automatically.

4. Under **Service access**, choose **Use another role**:
   - Service role: `LabRole`
   - EC2 instance profile: `LabInstanceProfile`

5. Click **Create**, then wait until the Events tab shows "Environment successfully launched."

## 5. Test the backend

Replace `YOUR-EB-URL` with the domain shown on the environment page:

```bash
curl http://YOUR-EB-URL/api/health

curl -i --max-time 60 -X POST http://YOUR-EB-URL/api/askanything \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Smart Speech Coach?"}'
```

- `/api/health` returns `{"status":"ok"}`.
- `/api/askanything` returns `HTTP/1.1 200 OK` with an `answer` field.

## 6. Health check note

The default Elastic Beanstalk health check requests `/`. The Express server does not serve that path, so a single-instance environment may show "1 health issue." The API routes work, as shown by the tests in Section 5. This is expected for this app.

## 7. Clean up

To stop charges after you finish:

1. In Elastic Beanstalk, select the environment, then **Actions → Terminate environment**.
2. In EC2, confirm the instance shows **Terminated**.
3. In the Learner Lab, click **End Lab**.

## 8. Issues encountered and solutions

### Issue 1: "Instance deployment failed to generate a 'Procfile' for Node.js"

**Error:**
```text
Instance deployment failed to generate a 'Procfile' for Node.js.
Provide one of these files: 'package.json', 'server.js', or 'app.js'.
```

**Cause:** The ZIP had its files inside a folder, so Elastic Beanstalk found no `package.json` at the top level.

**Solution:** Rebuild the ZIP from inside `backend` and confirm the listing in Section 3.

### Issue 2: Environment name can't be reused

**Cause:** Names of terminated environments stay reserved for a while.

**Solution:** Use a new name, such as `Smartspeech-backend-env-1`.

### Issue 3: Gemini returns an error or a 500

**Cause:** The model name in `geminiAskAnythingModel` is unavailable for the key.

**Solution:** Check the logs for `Gemini request failed:` in **Logs → Request logs**. Set `geminiAskAnythingModel` to a model your key supports, then update the environment property.

## 9. Alternative: single-domain deployment (not used)

It's also possible to build the React app, copy `frontend/dist` into `backend/dist`, and have Express serve it, so the frontend and API share one domain. This project did not use that approach, because the frontend runs locally and calls the Elastic Beanstalk backend.

## 10. Comparison: Cloud Run (Lab 3.3) vs. Elastic Beanstalk (Lab 3.4)

| Area | Cloud Run | Elastic Beanstalk |
|---|---|---|
| Deploy | One command: `gcloud run deploy --source .` | Create app and environment, upload ZIP |
| Environment variables | `--env-vars-file` at deploy time | Environment properties in the console |
| Build | Buildpacks, automatic | Installs packages on an EC2 instance |
| Scaling | Scales to zero when idle | Runs continuously in single-instance mode |
| Health checks | Automatic | Default checks `/`, which this app does not serve |
| Setup effort | Low | Higher: roles, ZIP layout, environment setup |
| Cost | Pay per request | Pay while the instance runs |
