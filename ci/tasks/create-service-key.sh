#!/bin/bash

set -e

cf api $CF_API
cf auth

cf t -o $CF_ORG -s $CF_SPACE

echo "BUCKET_NAME: $BUCKET_NAME"

# Delete and recreate to ensure fresh credentials
cf delete-service-key $BUCKET_NAME $BUCKET_NAME-pipeline-key -f || true
cf create-service-key $BUCKET_NAME $BUCKET_NAME-pipeline-key

mkdir -p s3-credentials
cf service-key $BUCKET_NAME $BUCKET_NAME-pipeline-key | tail -n +2 > s3-credentials/credentials.json

