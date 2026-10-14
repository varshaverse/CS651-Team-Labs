# LAB N3.1 – Node.js/Express and Google Cloud Run

## Project Details

- GitHub base repository: https://github.com/grewe/FormData
- Google Cloud project ID: `websystemproject-510817`
- Region: `us-central1`
- Cloud Run service: `lab-n3-1`
- Local URL: `http://localhost:3000`
- Cloud Run URL: https://websystemproject-510817-865816882128.us-central1.run.app/

Replace the project ID, service name, and URLs if your group uses different values.

## 1. Clone the GitHub Repository in Google Cloud Console

1. Open Google Cloud Console: https://console.cloud.google.com/
2. At the top, click the **Project selector**.
3. Select your existing project or click **New Project**.
4. If creating a project, enter a name, click **Create**, then select the new project.
5. Click **Activate Cloud Shell** in the top-right toolbar.
6. In Cloud Shell, clone the repository:

```bash
git clone https://github.com/grewe/FormData.git
cd FormData
```

The folder should contain `package.json` and the Node.js/Express source files.

## 2. Select the Google Cloud Project

```bash
gcloud config set project websystemproject-510817
gcloud config get-value project
```

The second command should display the selected project ID. Replace `websystemproject-510817` if your group uses another project.

## 3. Enable Required APIs

In Google Cloud Console, confirm the correct project is selected, then open **APIs & Services → Library** and enable:

- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API

Or run:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 4. Check the Node.js Project

From the cloned project folder:

```bash
cd FormData
cat package.json
```

Make sure `package.json` has a start command, for example:

```json
{
  "scripts": {
    "start": "node ./bin/www"
  }
}
```

## 5. Run the Application Locally

On your computer, open Terminal in the project folder:

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

To stop the local application, press **Control + C** in the terminal.

## 6. Deploy to Cloud Run from Cloud Shell

In Cloud Shell, inside the cloned repository, run:

```bash
gcloud run deploy websystem \
  --source . \
  --project websystemproject-510817 \
  --region us-central1 \
  --allow-unauthenticated
```

During deployment:

1. Confirm the project and region.
2. Answer `Y` if Google Cloud asks to enable an API.
3. Wait for Cloud Build to finish.
4. Wait for Cloud Run to create the service and revision.
5. Copy the Cloud Run URL displayed at the end.

## 7. Open and Test the Cloud Run URL

Get the service URL with:

```bash
gcloud run services describe websystem \
  --region us-central1 \
  --format="value(status.url)"
```

Open the displayed URL in a browser. You can also test it with:

https://websystemproject-510817-865816882128.us-central1.run.app/


In Google Cloud Console:

1. Open **Cloud Run**.
2. Confirm the correct project is selected.
3. Click the `lab-n3-1` service.
4. Confirm the latest revision is ready.
5. Open **Logs**.
6. Open the service URL.

## 8. Deploy from GitHub Through the Cloud Run Console

1. Open **Cloud Run** in Google Cloud Console.
2. Confirm the correct project is selected.
3. Click **Connect repository**.
4. Select **Cloud Build**.
5. Authenticate with GitHub if requested.
6. Select the repository and the `main` branch.
7. Select the Node.js buildpack option.
8. Set the build context directory to the repository root.
9. Enter the service name and region.
10. Select **Allow unauthenticated invocations**.
11. Click **Save**, then **Create**.
12. Wait for the build and deployment to finish.
13. Open the Cloud Run URL.

To test a new GitHub deployment:

```bash
git add .
git commit -m "Update Lab N3.1 application"
git push origin main
```

Cloud Build should create a new build and Cloud Run revision.

## 9. Show the Deployment Information

```bash
gcloud config get-value project
gcloud run services list --region us-central1
gcloud run services describe lab-n3-1 \
  --region us-central1 \
  --format="value(status.url)"
```

## 10. Stop the Applications

### Stop the local application

Press **Control + C** in the terminal running `npm start`.

### Remove the Cloud Run service after the demonstration

```bash
gcloud run services delete websystem \
  --region us-central1
```

Confirm the deletion when prompted. The GitHub repository won't get deleted.


