# Lab 3.4 — Elastic Beanstalk Deployment Steps

This document explains how to prepare the full-stack application and deploy it to AWS Elastic Beanstalk.

## 1. Required project structure

The project contains separate frontend and backend folders:

```text
Lab3.4/
├── frontend/
└── backend/
```

The Elastic Beanstalk ZIP must be created from the `backend` folder. The backend `package.json` must be directly at the top level of the ZIP.

## 2. Update the frontend API path

In `frontend/src/App.jsx`, use an empty server URL after deployment:

```javascript
const serverUrl = import.meta.env.PROD
  ? ""
  : "http://localhost:3001";
```

Keep the API request as:

```javascript
const response = await fetch(`${serverUrl}/api/askanything`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message: question }),
});
```

Local requests use:

```text
http://localhost:3001/api/askanything
```

After deployment, requests use the same Elastic Beanstalk domain:

```text
/api/askanything
```

## 3. Configure the backend to serve React

The `backend` folder should contain the built frontend in a `dist` folder:

```text
backend/
├── dist/
│   ├── index.html
│   └── assets/
├── package.json
└── server.js
```

In the backend server file, import `path` and define `__dirname` if the project uses ES modules:

```javascript
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

Use the Elastic Beanstalk port and listen on all interfaces:

```javascript
const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
```

After the API routes, serve the React files:

```javascript
app.use(express.static(path.join(__dirname, "dist")));

app.use((request, response, next) => {
  if (request.method === "GET" && !request.path.startsWith("/api")) {
    response.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    next();
  }
});
```

Make sure the backend `package.json` includes the correct start command:

```json
"scripts": {
  "start": "node server.js"
}
```

Replace `server.js` if the backend entry file has a different name.

## 4. Create the React `dist` folder

From the project directory, build the frontend:

```bash
cd frontend
npm install
npm run build
```

This creates:

```text
frontend/dist/
```

Copy the generated `dist` folder into the backend folder. Replace the old `backend/dist` folder if it already exists:

```text
backend/dist/
```

The final backend folder must contain both `package.json` and `dist`.

## 5. Create the deployment ZIP

Create the ZIP from inside the `backend` folder:

```bash
cd backend
zip -r ../Lab3.4-backend.zip . -x "node_modules/*" ".git/*"
```

Correct ZIP structure:

```text
Lab3.4-backend.zip
├── package.json
├── package-lock.json
├── server.js
├── dist/
└── other backend files
```

The ZIP must not have an extra outer folder such as:

```text
Lab3.4-backend.zip/backend/package.json
```

## 6. Deploy the ZIP to Elastic Beanstalk

1. Open **AWS Console → Elastic Beanstalk**.
2. Select the application and environment.
3. Confirm the region is **US East (N. Virginia) / `us-east-1`**.
4. Click **Upload and deploy**.
5. Select `Lab3.4-backend.zip`.
6. Enter a version label, such as:

   ```text
   lab3.4-fullstack-v1
   ```

7. Click **Deploy**.
8. Wait until the deployment finishes.
9. Open the Elastic Beanstalk **Domain** URL.

## 7. Add backend environment variables

Do not rely only on the local `backend/.env` file. Add these values in:

**Elastic Beanstalk → Configuration → Software → Environment properties**

```text
PORT=8080
GEMINI_API_KEY=your_gemini_api_key
askAnythingPrompt=your_prompt
geminiAskAnythingModel=your_model_name
allowedOrigins=http://your-elastic-beanstalk-domain
```

Keep `GEMINI_API_KEY` private. Do not place it in the frontend source code.

## 8. Test the deployment

Test the backend health endpoint:

```text
http://your-elastic-beanstalk-domain/api/health
```

Expected result:

```json
{
  "status": "ok"
}
```

Then open the main Elastic Beanstalk domain to test the React application.

If deployment fails, open **Elastic Beanstalk → Logs → Request Logs → Last 100 Lines** and check for errors.
