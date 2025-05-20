#!/bin/bash

# Script to fix common Amplify deployment issues
echo "Running Amplify deployment fixes..."

# Fix for Next.js build issues
echo "Fixing Next.js build configuration..."
if [ ! -f "next.config.js" ]; then
  echo "Creating next.config.js..."
  cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['blob.v0.dev'],
  },
}

module.exports = nextConfig
EOL
fi

# Fix for environment variables
echo "Checking environment variables..."
if [ -z "$AWS_REGION" ]; then
  echo "Warning: AWS_REGION is not set. Using default region."
fi

# Fix for package.json
echo "Checking package.json..."
if [ -f "package.json" ]; then
  # Ensure node engine is specified
  if ! grep -q "\"engines\"" package.json; then
    echo "Adding Node.js engine specification to package.json..."
    # Use temporary file for sed operation
    sed -i.bak '/"devDependencies": {/i \
  "engines": {\
    "node": ">=18.0.0"\
  },\
' package.json
    rm package.json.bak
  fi
fi

# Fix for AWS SDK dependencies
echo "Checking AWS SDK dependencies..."
if ! grep -q "@aws-sdk/client-bedrock-runtime" package.json; then
  echo "AWS SDK dependencies missing. Please add them to package.json."
  echo "Run: npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-sagemaker --save"
fi

echo "Fix script completed."
