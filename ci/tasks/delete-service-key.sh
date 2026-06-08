#!/bin/bash

set -e

cf api $CF_API
cf auth

cf t -o $CF_ORG -s $CF_SPACE

# Delete credentials
cf delete-service-key $BUCKET_NAME $BUCKET_NAME-pipeline-key -f
