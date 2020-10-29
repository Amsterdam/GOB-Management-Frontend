#!/usr/bin/env bash

set -u # crash on missing env
set -e # stop on any error

echo "Running style checks"
node node_modules/eslint/bin/eslint.js --config node_modules/eslint-config-react-app/index.js src

echo "Running unit and coverage tests"
yarn test --watchAll=false --coverage

auditexit=0

echo "Checking package versions"
yarn install -A
yarn audit --level high || auditexit=$?

if [ $auditexit -ge 8 ]; then
  echo "Found HIGH or CRITICAL security issues. Exiting"
  exit $auditexit
else
  echo "No HIGH or CRITICAL security issues found"
fi
