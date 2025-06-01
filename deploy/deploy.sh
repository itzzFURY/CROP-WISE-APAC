#!/bin/bash

# CropWise Secure Deployment Script
# This script deploys your CropWise backend to Google Cloud Run with secure API key management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
SERVICE_NAME="cropwise-backend"
REGION="us-central1"

echo -e "${GREEN}🌱 CropWise Secure Deployment Script${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get project ID
if [ -z "$PROJECT_ID" ]; then
    echo -n "Enter your Google Cloud Project ID: "
    read PROJECT_ID
fi

if [ -z "$PROJECT_ID" ]; then
    print_error "Project ID is required"
    exit 1
fi

print_status "Using project: $PROJECT_ID"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with gcloud. Please run 'gcloud auth login'"
    exit 1
fi

# Set the project
print_status "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
print_status "Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

print_success "APIs enabled successfully"

# Create secrets in Secret Manager
print_status "Setting up API key secrets in Google Secret Manager..."

# Gemini API Key
if ! gcloud secrets describe gemini-api-key &> /dev/null; then
    echo ""
    print_warning "Gemini API key secret not found. Creating new secret..."
    echo -n "Enter your Gemini API key: "
    read -s GEMINI_KEY
    echo
    
    if [ -z "$GEMINI_KEY" ]; then
        print_error "Gemini API key is required"
        exit 1
    fi
    
    echo -n "$GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-
    print_success "Gemini API key secret created"
else
    print_success "Gemini API key secret already exists"
fi

# Weather API Key
if ! gcloud secrets describe weather-api-key &> /dev/null; then
    echo ""
    print_warning "Weather API key secret not found. Creating new secret..."
    echo -n "Enter your OpenWeatherMap API key: "
    read -s WEATHER_KEY
    echo
    
    if [ -z "$WEATHER_KEY" ]; then
        print_error "Weather API key is required"
        exit 1
    fi
    
    echo -n "$WEATHER_KEY" | gcloud secrets create weather-api-key --data-file=-
    print_success "Weather API key secret created"
else
    print_success "Weather API key secret already exists"
fi

# Firebase Database URL
if ! gcloud secrets describe firebase-database-url &> /dev/null; then
    echo ""
    print_warning "Firebase Database URL secret not found. Creating new secret..."
    echo -n "Enter your Firebase Database URL: "
    read FIREBASE_DB_URL
    
    if [ -z "$FIREBASE_DB_URL" ]; then
        print_error "Firebase Database URL is required"
        exit 1
    fi
    
    echo -n "$FIREBASE_DB_URL" | gcloud secrets create firebase-database-url --data-file=-
    print_success "Firebase Database URL secret created"
else
    print_success "Firebase Database URL secret already exists"
fi

# Firebase Storage Bucket
if ! gcloud secrets describe firebase-storage-bucket &> /dev/null; then
    echo ""
    print_warning "Firebase Storage Bucket secret not found. Creating new secret..."
    echo -n "Enter your Firebase Storage Bucket name: "
    read FIREBASE_BUCKET
    
    if [ -z "$FIREBASE_BUCKET" ]; then
        print_error "Firebase Storage Bucket is required"
        exit 1
    fi
    
    echo -n "$FIREBASE_BUCKET" | gcloud secrets create firebase-storage-bucket --data-file=-
    print_success "Firebase Storage Bucket secret created"
else
    print_success "Firebase Storage Bucket secret already exists"
fi

# Change to backend directory
cd backend

# Deploy to Cloud Run
print_status "Building and deploying to Google Cloud Run..."
print_status "This may take a few minutes..."

gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest,WEATHER_API_KEY=weather-api-key:latest,FIREBASE_DATABASE_URL=firebase-database-url:latest,FIREBASE_STORAGE_BUCKET=firebase-storage-bucket:latest" \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0

print_success "Deployment completed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "=================================================="
print_success "CropWise Backend Deployed Successfully!"
echo "=================================================="
echo -e "${BLUE}Service URL:${NC} $SERVICE_URL"
echo -e "${BLUE}Health Check:${NC} $SERVICE_URL/health"
echo -e "${BLUE}API Base URL:${NC} $SERVICE_URL/api"
echo ""
print_warning "Next Steps:"
echo "1. Update your Angular frontend environment files with the new API URL"
echo "2. Test the deployment by visiting: $SERVICE_URL/health"
echo "3. Your repository is now safe to make public!"
echo ""
print_success "All API keys are securely stored in Google Secret Manager ✅"
