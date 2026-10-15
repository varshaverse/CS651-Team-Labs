# WebSystemProject

## Web System Project – Group Lab Exercises

## Overview

This repository contains the group lab exercises for the Web System Project. It demonstrates the development of web applications using Node.js and Express, frontend-to-backend communication, REST/JSON APIs, AI integration using the Google Gemini API, and cloud deployment using Google Cloud Run and AWS Elastic Beanstalk.

Each lab has its own folder containing the source code and a dedicated `README.md` with detailed implementation, setup, and deployment instructions.

## Technologies and Tools

- Node.js
- Express.js
- HTML, CSS, and JavaScript
- REST APIs and JSON
- JavaScript Fetch API
- Git and GitHub
- Google Gemini API
- Google Cloud Run
- Google Cloud CLI
- AWS Elastic Beanstalk
- Visual Studio Code or another suitable IDE


## Lab Exercises

### [Lab N3.1](https://github.com/varshaverse/CS651-Team-Labs/tree/main/Lab3.1) – Node.js, Express, Git, and Google Cloud Run

This lab focuses on setting up a development environment and creating a basic Node.js and Express application.

**Key activities:**

- Configure an IDE with Git and Google Cloud CLI.
- Create and run a Node.js and Express application locally.
- Push the source code to GitHub.
- Deploy the application to Google Cloud Run.
- Demonstrate the application running locally and in the cloud.
- Demonstrate how to stop the local server and manage the deployed service.
- Understand manual and Git-based deployment workflows.

**Documentation:** Refer to the `README.md` inside the Lab N3.1 folder.

### [Lab N3.2](https://github.com/varshaverse/CS651-Team-Labs/tree/main/Lab3.2) – HTML Forms and REST/JSON APIs

This lab explores how HTML forms interact with backend services and how applications exchange information using REST APIs and JSON.

**Key activities:**

- Create and process HTML forms.
- Implement backend routes and API endpoints.
- Exchange data between frontend and backend.
- Handle JSON requests and responses.
- Test API functionality.

**Documentation:** Refer to the `README.md` inside the Lab N3.2 folder.

### [Lab N3.3](https://github.com/varshaverse/CS651-Team-Labs/tree/main/Lab3.3) – AI-Enabled Full-Stack Web Application

This lab extends a Node.js and Express backend with AI functionality using the Google Gemini API.

**Key activities:**

- Develop a frontend using HTML, CSS, and JavaScript.
- Implement an AI-enabled backend using Node.js and Express.
- Use JavaScript `fetch()` to invoke backend endpoints.
- Exchange data between frontend and backend using JSON.
- Configure Gemini API credentials securely.
- Deploy the backend to Google Cloud Run.
- Demonstrate the frontend communicating with the deployed backend.
- Document the deployment steps and configuration in GitHub.

**Documentation:** Refer to the `README.md` inside the Lab N3.3 folder.

### [Lab N3.4](https://github.com/varshaverse/CS651-Team-Labs/tree/main/Lab3.4) – AWS Elastic Beanstalk Deployment

This lab deploys the backend developed in Lab N3.3 to AWS Elastic Beanstalk and compares it with Google Cloud Run.

**Key activities:**

- Prepare the Node.js backend for AWS deployment.
- Configure the AWS Elastic Beanstalk environment.
- Set the required environment variables.
- Deploy and test the application.
- Document the AWS deployment process.
- Compare Google Cloud Run and AWS Elastic Beanstalk in terms of deployment, configuration, scaling, and application management.

**Documentation:** Refer to the `README.md` inside the Lab N3.4 folder.

## Prerequisites

Install or configure the following tools as needed for each lab:

- Node.js and npm
- Git
- Visual Studio Code or another IDE
- Google Cloud CLI
- A Google Cloud project with the required APIs, permissions, and billing configuration
- An AWS account for Lab N3.4
- A Gemini API key for AI-enabled labs

## Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the HTTPS or SSH URL of this repository.

### 2. Navigate to a Lab Folder

```bash
cd "YOUR_LAB_FOLDER"
```

Replace `YOUR_LAB_FOLDER` with the actual folder name for the lab you want to run.

### 3. Install Dependencies

```bash
npm install
```

Run this command in the directory containing the lab's `package.json` file.

### 4. Configure Environment Variables

If the application requires environment variables, configure them according to the relevant lab README.

For example, an AI-enabled application may require a Gemini API key. Keep secrets out of source code and do not commit `.env` files to GitHub.

### 5. Run the Application Locally

```bash
npm start
```

If the project uses a different start script, use the command specified in its `package.json` or lab README.

Open the local URL printed in the terminal, for example `http://localhost:3000`, if port 3000 is configured.

## Cloud Deployment

The repository includes exercises covering two cloud deployment platforms.

### Google Cloud Run

Labs N3.1 and N3.3 cover deploying Node.js and Express applications to Google Cloud Run.

Typical deployment activities include:

- Selecting the correct Google Cloud project.
- Configuring the Google Cloud CLI.
- Enabling the required services.
- Deploying the application from source or through a Git-based workflow.
- Testing the deployed service URL.
- Documenting deployment and configuration steps.

### AWS Elastic Beanstalk

Lab N3.4 covers deploying the Lab N3.3 backend to AWS Elastic Beanstalk.

Typical deployment activities include:

- Preparing the application for AWS.
- Configuring environment settings and variables.
- Deploying the application.
- Testing the deployed endpoint.
- Comparing the AWS deployment process with Google Cloud Run.

Refer to each lab's README for the exact commands and deployment steps.

## Security and Configuration

- Never commit API keys, passwords, access tokens, or cloud credentials to GitHub.
- Store sensitive values in environment variables or an appropriate secrets manager.
- Add `.env` and other secret files to `.gitignore`.
- Keep Gemini API keys on the backend rather than exposing them in frontend JavaScript.
- Configure service access permissions appropriately.
- Avoid committing generated files, dependencies, or credentials unless specifically required.

## Learning Outcomes

These labs are intended to demonstrate the ability to:

- Build web applications using Node.js and Express.
- Use Git and GitHub for version control.
- Create and test REST/JSON APIs.
- Connect frontend applications to backend services using `fetch()`.
- Integrate AI functionality using the Gemini API.
- Run and test applications locally.
- Deploy applications to Google Cloud Run.
- Deploy a backend to AWS Elastic Beanstalk.
- Understand cloud deployment workflows and compare cloud platforms.
- Document application setup, deployment, and testing procedures.

## Project Documentation

Each lab folder contains a separate README with its specific implementation and deployment instructions.

For detailed setup commands, configuration, testing procedures, and deployment steps, refer to the README in the corresponding lab folder.

This repository organizes the group's work for Labs N3.1, N3.2, N3.3, and N3.4. Deployment URLs, screenshots, and test results should be added to the relevant lab documentation after the applications have been successfully tested.
