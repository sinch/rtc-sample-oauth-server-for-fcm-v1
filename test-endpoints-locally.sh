#!/bin/bash

set -euo pipefail

fail_if_command_unavailable() {
    if ! command -v $1 &> /dev/null; then
        echo "Error: this script requires the following command: $1"
        exit 1
    fi
}

fail_if_command_unavailable "jq"
fail_if_command_unavailable "curl"

CLIENT_ID=$(jq -r '.client_credentials.client_id' placeholders/config.json)
CLIENT_SECRET=$(jq -r '.client_credentials.client_secret' placeholders/config.json)
FCM_PROJECT_NUMBER=$(jq -r '.fcm_config.expected_fcm_project_number' placeholders/config.json)

ACCESS_TOKEN=$(curl --request POST \
  --url 'http://localhost:1000/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data grant_type=client_credentials \
  --data "client_id=$CLIENT_ID" \
  --data "client_secret=$CLIENT_SECRET" \
  --data "scope=https://www.googleapis.com/auth/firebase.messaging" | jq -r '.access_token')

FCM_TOKEN=$(curl --request POST \
  --url 'http://localhost:1000/oauth/fcm-token' \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data "fcm_project_number=$FCM_PROJECT_NUMBER" \
  --data grant_type=client_credentials | jq -r '.access_token')

echo "Successfully fetched FCM token: $FCM_TOKEN"
