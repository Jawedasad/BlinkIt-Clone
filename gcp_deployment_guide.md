# GCP Deployment Guide

This guide provides comprehensive steps to deploy the application to Google Cloud Platform (GCP) using Google Kubernetes Engine (GKE) and setting up a CI/CD pipeline. It also configures Razorpay for payment processing.

## Prerequisites

*   A Google Cloud account with billing enabled.
*   A domain name (optional, for setting up HTTPS).
*   The Google Cloud SDK installed and configured. See the [Google Cloud SDK documentation](https://cloud.google.com/sdk/docs/install) for installation instructions.
*   Docker installed on your local machine. See the [Docker documentation](https://docs.docker.com/get-docker/) for installation instructions.
*   Basic knowledge of Docker, Kubernetes, and CI/CD concepts. Here are some helpful resources:
    *   **Docker:** [Docker overview](https://docs.docker.com/get-started/)
    *   **Kubernetes:** [Kubernetes basics](https://kubernetes.io/docs/concepts/overview/what-is-kubernetes/)
    *   **CI/CD:** [CI/CD concepts](https://www.redhat.com/en/topics/devops/what-is-ci-cd)

## 1. Create a Google Cloud Project

    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   If you don't have a Google Cloud account, create one.
    *   Click on the project dropdown at the top of the console and select "New Project".
    *   Enter a project name and project ID. The project ID must be unique across all of Google Cloud.
    *   Select your organization (if applicable) and location.
    *   Click "Create".

## 2. Set up Google Container Registry (GCR)

    *   Enable the Container Registry API: In the Google Cloud Console, go to "IAM & Admin" -> "APIs & Services". Search for "Container Registry API" and enable it.
    *   Configure the gcloud CLI:
        ```bash
        gcloud init
        gcloud config set project <your-project-id>
        gcloud auth configure-docker
        ```
        (replace `<your-project-id>` with your actual project ID).

## 3. Configure a Google Kubernetes Engine (GKE) cluster

    *   Create a GKE cluster: In the Google Cloud Console, go to "Kubernetes Engine" -> "Clusters" and click "Create".
    *   Choose a cluster name, zone or region, and machine type. For production, consider using a regional cluster for higher availability.
    *   Configure the number of nodes in the cluster.
    *   Click "Create". This may take several minutes.
    *   Once the cluster is created, get the credentials to access it:
        ```bash
        gcloud container clusters get-credentials <your-cluster-name> --zone <your-cluster-zone> --project <your-project-id>
        ```
        (replace `<your-cluster-name>`, `<your-cluster-zone>`, and `<your-project-id>` with your actual cluster name, zone, and project ID).

## 4. Deploy the application to GKE

    *   **Build and push Docker images:**
        *   Build the server image:
            ```bash
            docker build -t gcr.io/<your-project-id>/<server-image-name>:latest -f server/Dockerfile .
            ```
            (replace `<your-project-id>` with your project ID and `<server-image-name>` with a name for your server image).
        *   Build the client image:
            ```bash
            docker build -t gcr.io/<your-project-id>/<client-image-name>:latest -f client/Dockerfile .
            ```
            (replace `<your-project-id>` with your project ID and `<client-image-name>` with a name for your client image).
        *   Push the server image:
            ```bash
            docker push gcr.io/<your-project-id>/<server-image-name>:latest
            ```
        *   Push the client image:
            ```bash
            docker push gcr.io/<your-project-id>/<client-image-name>:latest
            ```
    *   **Create Kubernetes deployment and service configurations:**
        *   Create a `server-deployment.yaml` file:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: server
  template:
    metadata:
      labels:
        app: server
    spec:
      containers:
        - name: server
          image: gcr.io/<your-project-id>/<server-image-name>:latest
          ports:
            - containerPort: 8000
          env:
            - name: MONGODB_URI
              value: <your-mongodb-uri>
            - name: RAZORPAY_KEY_ID
              value: <your-razorpay-key-id>
            - name: RAZORPAY_KEY_SECRET
              value: <your-razorpay-key-secret>
---
apiVersion: v1
kind: Service
metadata:
  name: server-service
spec:
  selector:
    app: server
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
```

        *   Create a `client-deployment.yaml` file:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
        - name: client
          image: gcr.io/<your-project-id>/<client-image-name>:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: client-service
spec:
  selector:
    app: client
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

    *   **Deploy the application:**
        *   Apply the server deployment:
            ```bash
            kubectl apply -f server-deployment.yaml
            ```
        *   Apply the client deployment:
            ```bash
            kubectl apply -f client-deployment.yaml
            ```

## 5. Set up a managed MongoDB instance:

    *   **MongoDB Atlas:**
        *   Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
        *   Create a new project and cluster. Choose a region close to your GKE cluster for low latency.
        *   Configure network access to allow connections from your GKE cluster. You can either whitelist the GKE cluster's public IP address or use VPC peering (recommended for production).
        *   Create a database user with appropriate permissions.
        *   Get the connection string for your MongoDB Atlas cluster.
    *   **Google Cloud MongoDB:**
        *   Use Google Cloud's managed MongoDB service.
        *   Create a new MongoDB instance. Choose a region close to your GKE cluster for low latency.
        *   Configure network access to allow connections from your GKE cluster.
        *   Create a database user with appropriate permissions.
        *   Get the connection string for your Google Cloud MongoDB instance.
    *   **Configure the server:**
        *   Update the `server-deployment.yaml` file with the MongoDB connection string:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: server
  template:
    metadata:
      labels:
        app: server
    spec:
      containers:
        - name: server
          image: gcr.io/<your-project-id>/<server-image-name>:latest
          ports:
            - containerPort: 8000
          env:
            - name: MONGODB_URI
              value: <your-mongodb-uri>
```

        *   Replace `<your-mongodb-uri>` with your actual MongoDB connection string.
        *   Apply the updated server deployment: `kubectl apply -f server-deployment.yaml`

## 6. Configure Razorpay for Payments

    *   **Set up a Razorpay Account:**
        *   Go to the [Razorpay website](https://razorpay.com/) and create an account.
        *   Get your Key ID and Key Secret from the Razorpay dashboard.
    *   **Configure the server:**
        *   Update the `server-deployment.yaml` file with the Razorpay credentials:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: server
  template:
    metadata:
      labels:
        app: server
    spec:
      containers:
        - name: server
          image: gcr.io/<your-project-id>/<server-image-name>:latest
          ports:
            - containerPort: 8000
          env:
            - name: MONGODB_URI
              value: <your-mongodb-uri>
            - name: RAZORPAY_KEY_ID
              value: <your-razorpay-key-id>
            - name: RAZORPAY_KEY_SECRET
              value: <your-razorpay-key-secret>
```

        *   Replace `<your-mongodb-uri>`, `<your-razorpay-key-id>`, and `<your-razorpay-key-secret>` with your actual MongoDB connection string and Razorpay credentials.
        *   Apply the updated server deployment: `kubectl apply -f server-deployment.yaml`

## 7. Enable CI/CD: Choosing a Method

This guide provides instructions for setting up CI/CD using either GitHub Actions or Google Cloud Build. Both methods can be used to automate the deployment process, but they have different advantages and disadvantages.

*   **GitHub Actions:** A popular CI/CD platform that is tightly integrated with GitHub. It is easy to set up and use, and it offers a wide range of features and integrations. However, it may not be suitable for all projects, especially those that require tight integration with Google Cloud services.
*   **Google Cloud Build:** A CI/CD platform that is tightly integrated with Google Cloud services. It offers a high degree of control and customization, and it is well-suited for projects that require tight integration with Google Cloud services. However, it can be more complex to set up and use than GitHub Actions.

For most projects, **GitHub Actions is the recommended CI/CD method** due to its ease of use and integration with GitHub. However, if you require tight integration with Google Cloud services or need a high degree of control and customization, Google Cloud Build may be a better choice.

## 8. Enable CI/CD with GitHub Actions

    *   **Prerequisites:**
        *   A GitHub repository for your application code.
        *   A Google Cloud service account with the necessary permissions to deploy to GKE (Kubernetes Engine Admin role).
    *   **GitHub Actions Setup:**
        *   Create a Google Cloud service account with the necessary permissions to deploy to GKE.
        *   Download the service account key as a JSON file.
        *   Add the service account key as a secret to your GitHub repository named `GCP_SA_KEY`.  To do this: In your GitHub repository, go to "Settings" -> "Secrets" -> "Actions" and click "New repository secret".  Name the secret `GCP_SA_KEY` and paste the contents of the JSON file as the value.
        *   Create a `.github/workflows/deploy.yaml` file in your repository:

```yaml
name: Deploy to GKE

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      - name: Set up GKE credentials
        uses: google-github-actions/get-gke-credentials@v1
        with:
          cluster_name: '<your-cluster-name>'
          location: '<your-cluster-zone>'
      - name: Deploy to GKE
        run: |
          kubectl apply -f server-deployment.yaml
          kubectl apply -f client-deployment.yaml
```

        *   Replace `<your-cluster-name>` and `<your-cluster-zone>` with your actual cluster name and zone.
        *   Commit and push the `.github/workflows/deploy.yaml` file to your repository.

## 9. Enable CI/CD with Google Cloud Build

    *   **Prerequisites:**
        *   Your application code must be in a Git repository (e.g., GitHub, Cloud Source Repositories).
        *   Enable the Cloud Build API: In the Google Cloud Console, go to "IAM & Admin" -> "APIs & Services". Search for "Cloud Build API" and enable it.
    *   **Google Cloud Build Setup:**
        *   Create a `cloudbuild.yaml` file in the root of your repository:

```yaml
steps:
  # Build the server image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/<your-project-id>/<server-image-name>:$SHORT_SHA', '-f', 'server/Dockerfile', '.']
  # Push the server image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/<your-project-id>/<server-image-name>:$SHORT_SHA']
  # Build the client image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/<your-project-id>/<client-image-name>:$SHORT_SHA', '-f', 'client/Dockerfile', '.']
  # Push the client image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/<your-project-id>/<client-image-name>:$SHORT_SHA']
  # Deploy to GKE
  - name: 'gcr.io/cloud-builders/kubectl'
    args: ['apply', '-f', 'server-deployment.yaml']
    env:
      - name: SHORT_SHA
        value: '$SHORT_SHA'
  - name: 'gcr.io/cloud-builders/kubectl'
    args: ['apply', '-f', 'client-deployment.yaml']
    env:
      - name: SHORT_SHA
        value: '$SHORT_SHA'
images:
  - 'gcr.io/<your-project-id>/<server-image-name>:$SHORT_SHA'
  - 'gcr.io/<your-project-id>/<client-image-name>:$SHORT_SHA'
```

        *   Replace `<your-project-id>`, `<server-image-name>`, and `<client-image-name>` with your actual project ID and image names.
        *   Create a Cloud Build trigger: In the Google Cloud Console, go to "Cloud Build" -> "Triggers" and click "Create Trigger".
        *   Configure the trigger to build on push to your repository.
        *   Select the `cloudbuild.yaml` file as the build configuration file.

## 9. Configure DNS (Optional)

    *   Get the external IP address of the Ingress controller:
        ```bash
        kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
        ```
    *   Create an A record in your DNS settings that points your domain to the external IP address of the Ingress controller.

## Conclusion

This guide provides a comprehensive overview of deploying the application to GCP using GKE, setting up CI/CD, and configuring Razorpay for payments. Remember to replace placeholder values with your actual configuration details.
