#!/bin/bash
set -e

ACCESS_KEY=$(jq -r '.credentials.access_key_id' s3-credentials/credentials.json)
SECRET_KEY=$(jq -r '.credentials.secret_access_key' s3-credentials/credentials.json)
BUCKET=$(jq -r '.credentials.bucket' s3-credentials/credentials.json)
REGION=$(jq -r '.credentials.region' s3-credentials/credentials.json)
ENDPOINT=$(jq -r '.credentials.fips_endpoint' s3-credentials/credentials.json)

AWS_ACCESS_KEY_ID=$ACCESS_KEY \
AWS_SECRET_ACCESS_KEY=$SECRET_KEY \
aws s3 sync src/pages-exports s3://$BUCKET/pages-exports-$APP_ENV \
  --region $REGION \
  --endpoint-url https://$ENDPOINT

