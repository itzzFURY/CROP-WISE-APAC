# CropWise

The UI (Angular SPA) is deployed in an NGINX container.
The API (Python Flask app) is deployed in a Python container.

## Build the Docker images

```sh
# Build the backend image
docker build -t cropwise-backend ./cropwise-backend

# Buidl the frontend image
docker build -t cropwise-frontend ./cropwise-frontend
```

## Run the Docker containers

```sh
# Run the backend container
docker run -p 5000:5000 cropwise-backend

# Run the frontend container
docker run -p 8080:8080 cropwise-frontend
```

## Deploying on GCP

The GCP project is called `CROP-WISE`.

The built images are uploaded to Google Artifact Registry in the `australia-southeast2` (Melbourne) region.

```sh
gcloud auth configure-docker australia-southeast2-docker.pkg.dev
```

