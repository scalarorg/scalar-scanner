#!/bin/bash

if [[ "$VERCEL_GIT_COMMIT_REF" == "main" || "$VERCEL_GIT_COMMIT_REF" == *"feat/"* || "$VERCEL_GIT_COMMIT_REF" == *"chore/"* ]] && ! [[ "$VERCEL_URL" == *"v1"* ]] && ! [[ "$VERCEL_URL" == *"v0"* ]]; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;
else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi