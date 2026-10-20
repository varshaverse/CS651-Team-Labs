# Lab 3.4: Deploy the Backend and Frontend to AWS

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

The listing must show `package.json` and `server.js` with no folder name in front of them. A path such as `backend/package.json` causes the deployment error described in Section 8. Do not include `.env` files or `node_modules`.

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

Domain: `smartspeech-backend-env-1.eba-hmqfvpqk.us-east-1.elasticbeanstalk.com`

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

## 6. Deploy the frontend to S3

The frontend is a static site, so it's hosted in an S3 bucket. The backend URL is built into the files, so rebuild the frontend whenever `frontend/.env` changes.

### Step 1: Build the frontend

```bash
cd frontend
npm run build
```

The output goes to the `frontend/dist` folder.

### Step 2: Create the bucket

1. Open **S3** in the console (region **us-east-1**) and click **Create bucket**.
2. Bucket name: `smartspeech-frontend`
3. Under **Block Public Access settings for this bucket**, uncheck **Block all public access**, then check the acknowledgment box.
4. Click **Create bucket**.

### Step 3: Turn on static website hosting

1. Open the bucket and click the **Properties** tab.
2. Scroll to **Static website hosting** and click **Edit**.
3. Select **Enable**, leave **Host a static website** selected, and set **Index document** to `index.html`.
4. Click **Save changes**.
5. Copy the **Bucket website endpoint**: `http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com`

### Step 4: Allow public reads

1. Open the **Permissions** tab.
2. Under **Block public access (bucket settings)**, make sure all four options are off.
3. Under **Bucket policy**, click **Edit**, paste the policy below, and click **Save changes**:

```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::smartspeech-frontend/*"
       }
     ]
   }
```

### Step 5: Upload the built files

1. Open the **Objects** tab and click **Upload**.
2. Click **Add files**, press **Cmd + Shift + G**, and paste the path to the `dist` folder: `~/Documents/Project/webSystem/CS651-Team-Labs/Lab3.4/frontend/dist`.
3. Press **Cmd + A** to select the contents of `dist`: `index.html`, `favicon.svg`, `icons.svg`, and the `assets` folder. Upload the contents, not the `dist` folder itself, so `index.html` is at the top level of the bucket.
4. Click **Upload**, then **Close**.

### Step 6: Test the site

Open `http://smartspeech-frontend.s3-website-us-east-1.amazonaws.com`, hard-refresh with **Cmd + Shift + R**, and send a question. The answer should appear.

### Redeploying the frontend

After any change to the frontend, run `npm run build` again, then upload the new `dist` contents to the bucket and overwrite the existing files.

## 7. Health check note

The default Elastic Beanstalk health check requests `/`, which the Express server does not serve. The app also has `/api/health`, which returns `{"status":"ok"}`. A single-instance environment can show "Pending" or "1 health issue" even when the API works. Confirm the API with the tests in Section 5 before troubleshooting further.

## 8. Clean up

To stop charges after you finish:

1. In Elastic Beanstalk, select the environment, then **Actions → Terminate environment**.
2. In EC2, confirm the instance shows **Terminated**.
3. Empty and delete the S3 bucket if you no longer need the site.
4. In the Learner Lab, click **End Lab**.

## 9. Issues encountered and solutions

### Issue 1: "Instance deployment failed to generate a 'Procfile' for Node.js"

**Error:**
```text
Instance deployment failed to generate a 'Procfile' for Node.js.
Provide one of these files: 'package.json', 'server.js', or 'app.js'.
```

**Cause:** The ZIP had its files inside a folder, so Elastic Beanstalk found no `package.json` at the top level. The engine log showed `there is no package.json file, skip installing dependencies`.

**Solution:** Rebuild the ZIP from inside `backend` and confirm the listing in Section 3.

### Issue 2: Environment still runs the old version after uploading

**Cause:** Elastic Beanstalk kept running the previous bundle because the upload used a version label that was already in use, or the upload didn't finish.

**Solution:** Use **Upload and deploy** with a new version label (`v2`, `v3`, and so on). Confirm the **Running version** on the environment page changes before testing.

### Issue 3: "Unable to assign role" when creating the environment

**Error:**
```text
Unable to assign role. Please verify that you have permission to pass this role: aws-elasticbeanstalk-service-role.
```

**Cause:** The Learner Lab account cannot create new IAM roles.

**Solution:** Choose the existing `LabRole` and `LabInstanceProfile` under **Use another role**.

### Issue 4: Environment name can't be reused

**Cause:** Names of terminated environments stay reserved for a while.

**Solution:** Use a new name, such as `smartspeech-backend-env-2`.

### Issue 5: "Failed to fetch," `ERR_CONNECTION_REFUSED`, or `ERR_NAME_NOT_RESOLVED`

**Cause:** The frontend is calling an old or terminated environment, or the environment is down. A terminated environment usually causes a connection failure, and a mistyped domain causes a name-resolution failure.

**Solution:** Set `VITE_SERVER_URL_REMOTE` in `frontend/.env` to the current domain, rebuild the frontend, and check the Request URL in DevTools → Network. Run the health check in Section 5. If it fails, check that the environment is running.

### Issue 6: CORS error ("blocked by CORS policy")

**Cause:** The backend doesn't send `Access-Control-Allow-Origin` for the frontend's address. This happens in two cases:
- The frontend's origin is missing from `allowedOrigins`.
- `server.js` has a second, hardcoded `cors` block that runs first and ignores `allowedOrigins`.

**Solution:**
1. Confirm `allowedOrigins` includes the exact frontend origin, with `http://` and no trailing slash.
2. Confirm `server.js` has only one line that matches `app.use(cors(`, and that it uses `origin: allowedOrigins`.
3. Redeploy the backend with a new version label, then run the OPTIONS check in Section 5.

### Issue 7: Gemini returns an error or a 500

**Cause:** The model name in `geminiAskAnythingModel` is unavailable for the key.

**Solution:** Check the logs for `Gemini request failed:` in **Logs → Request logs**. Set `geminiAskAnythingModel` to a model your key supports, then update the environment property.

## 10. Alternative: single-domain deployment (not used)

It's also possible to build the React app, copy `frontend/dist` into `backend/dist`, and have Express serve it, so the frontend and API share one domain. This project did not use that approach, because the frontend is hosted on S3 and calls the Elastic Beanstalk backend.

Note: The S3 site uses plain HTTP, and so does the Elastic Beanstalk backend, so the browser allows the requests. A production HTTPS site would need HTTPS on both the frontend and the backend, which requires a load balancer and a certificate for the backend.

## 11. Comparison: Cloud Run (Lab 3.3) vs. Elastic Beanstalk and S3 (Lab 3.4)

| Area | Cloud Run | Elastic Beanstalk and S3 |
|---|---|---|
| Deploy backend | One command: `gcloud run deploy --source .` | Create app and environment, upload ZIP |
| Deploy frontend | Usually hosted with the backend or Firebase | Build, then upload `dist` to an S3 bucket |
| Environment variables | `--env-vars-file` at deploy time | Environment properties in the console |
| Build | Buildpacks, automatic | Installs packages on an EC2 instance |
| Scaling | Scales to zero when idle | Runs continuously in single-instance mode |
| Health checks | Automatic | Default checks `/`, which this app does not serve |
| HTTPS | Included automatically | Plain HTTP by default |
| Setup effort | Low | Higher: roles, ZIP layout, CORS, bucket policy |
| Cost | Pay per request | Pay while the instance runs; S3 costs very little |
