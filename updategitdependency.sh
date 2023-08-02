#!/bin/bash
echo updating mongoapiclient
npm i --package-lock-only github:/c3pobot/mongoapiclient
echo updating logger
npm i --package-lock-only github:c3pobot/logger
echo updating s3client
npm i --package-lock-only github:c3pobot/s3client
