#!/usr/bin/env bash

set -u # crash on missing env
set -e # stop on any error

echo "Checking package versions"
yarn install -A
yarn audit --level high || auditexit=$?

if [ $auditexit -ge 8 ]; then
  exit $auditexit
else
  echo "No HIGH or CRITICAL security issues found"
fi

echo "Running style checks"
node node_modules/eslint/bin/eslint.js --config node_modules/eslint-config-react-app/index.js src

echo "Running unit tests"
#npm run test:unit
