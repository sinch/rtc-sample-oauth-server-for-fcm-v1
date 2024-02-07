#!/bin/bash

# The application is not supposed to run if some placeholders string ('PLACEHOLDER') was not replaced in placeholders/*.json
# files. This script tries to start up the app without performing any replacement, and verifies it fails with the expected
# error code.

cleanup() {
    rm -f logs.txt
}

trap cleanup EXIT

cleanup

timeout 30 npm run start > logs.txt

if [ $? -eq 124 ]; then
    echo "Error, the app was supposed to be killed at startup."
    exit 1
else
    if ! grep -qi "placeholders" logs.txt; then
        echo "The app was supposed to be killed because of existing placeholders."
        exit 1
    fi
fi
