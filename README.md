## Vercel Clone Project README

### Introduction
This project is a simplified clone of Vercel, designed to deploy and manage applications using AWS ECS and Fargate. It provides an API to trigger deployments of projects hosted on Git repositories and utilizes S3 for storing built assets. The build server is set up once using a Docker container, while the API server and S3 reverse proxy run continuously to handle requests and serve deployments.

### Features
- Deploy applications by providing a Git repository URL.
- Automated cloning and building of repositories.
- Upload built assets to S3.
- Fetch and deploy applications from S3.

### Prerequisites
- Node.js v14 or above
- AWS account with ECS, Fargate, and S3 permissions
- Docker installed and configured
- Environment variables configured (see below)

### Environment Variables
Create a `.env` file in the root of your project and add the following environment variables:

```plaintext
REGION=your-aws-region
ACCESS_KEY=your-aws-access-key
SECRET_ACCESS_KEY=your-aws-secret-access-key
CLUSTER_NAME=your-ecs-cluster-name
TASK=your-ecs-task-definition
SUBNET_A=your-subnet-id-a
SUBNET_B=your-subnet-id-b
SUBNET_C=your-subnet-id-c
SECURITY_GROUP=your-security-group-id
BUILDER_IMAGE=your-builder-image-name
DOMAIN=your-domain-name
S3_BUCKET_NAME=your-s3-bucket-name
```

### Directory Structure

- **api-server:** Contains the API server code that automates the build server's work.
- **build-server:** Handles cloning repositories, building them, and uploading to S3. Only needs to be set up once using Docker.
- **s3-reverse-proxy:** Fetches from S3 and deploys the website.
- **performance/reports:** Contains performance test reports in JSON and HTML formats.

### Installation

Install dependencies for all three directories:

1. **API Server:**
   ```bash
   cd api-server
   npm install
   ```

2. **Build Server:**
   ```bash
   cd build-server
   npm install
   ```

3. **S3 Reverse Proxy:**
   ```bash
   cd s3-reverse-proxy
   npm install
   ```

### Build Server Setup

The build server uses a Docker container to clone repositories, build them, and upload the built assets to S3. Once the Docker container is set up, it does not need to run continuously.

#### Note
If the Dockerfile is pushed to Amazon ECR (Elastic Container Registry), it simplifies the process of running the program.

#### Building the Docker Image

1. Navigate to the `build-server` directory:
   ```bash
   cd build-server
   ```

2. Build the Docker image:
   ```bash
   docker build -t build-server-image .
   ```

3. Push the Docker image to ECR (optional but recommended for ease of deployment).

### Starting the Servers

1. Start the API server:
   ```bash
   cd api-server
   npm start
   ```

2. Start the S3 reverse proxy server:
   ```bash
   cd s3-reverse-proxy
   npm start
   ```

### API Endpoints

#### Create a new project

- **URL:** `/project`
- **Method:** `POST`
- **Body Parameters:**
  - `gitUrl` (string): The URL of the Git repository to deploy.

- **Response:**
  ```json
  {
      "status": "queued",
      "data": {
          "projectSlug": "generated-project-slug",
          "url": "http://generated-project-slug.your-domain"
      }
  }
  ```

### Performance Testing

Performance testing was conducted using Artillery. The results of the tests can be found in the `performance/reports` directory:

- **JSON Report**: [performance/reports/report.json](performance/reports/report.json)
- **HTML Report**: [performance/reports/report.html](performance/reports/report.html)

**Test Summary:**
- **Number of Requests:** 600
- **HTTP Status Code 200:** 600
- **Data Transferred:** 71,002 bytes
- **Virtual Users Completed:** 600
- **Virtual Users Created:** 600

### Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas.
