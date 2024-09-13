#!/usr/bin/env bash
set -Ex

# This method has been inspired by the comment here:
# https://github.com/vercel/next.js/discussions/17641#discussioncomment-339555

env_vars="NEXT_PUBLIC_APP_URL NEXT_PUBLIC_STATUS_MESSAGE NEXT_PUBLIC_ENVIRONMENT NEXT_PUBLIC_AXELARSCAN_API_URL NEXT_PUBLIC_VALIDATOR_API_URL NEXT_PUBLIC_TOKEN_TRANSFER_API_URL NEXT_PUBLIC_GMP_API_URL NEXT_PUBLIC_RPC_URL NEXT_PUBLIC_LCD_URL NEXT_PUBLIC_GTM_ID NEXT_PUBLIC_GA_TRACKING_ID NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID NEXT_PUBLIC_DEFAULT_TITLE NEXT_PUBLIC_DEFAULT_DESCRIPTION NEXT_PUBLIC_CUSTOM_EVM_CHAINS"

function apply_path {
    # Replace placeholders in /app/dist directory
    for var in $env_vars; do
        echo "Replacing ${var} with ${!var}"
        find /app/dist \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_${var}#${!var}#g"
    done
}

apply_path
echo "Starting Nextjs"
exec "$@"
