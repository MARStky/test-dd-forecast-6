# Setting Up AWS SSO with AWS Amplify Deployment

This guide explains how to use AWS SSO authentication with your application deployed on AWS Amplify.

## Overview

When using AWS Amplify, there are two authentication approaches:

1. **Local Development**: Uses AWS SSO with your local AWS profile
2. **Production Deployment**: Uses Amplify service roles with IAM permissions

## Prerequisites

1. AWS Organizations and AWS SSO enabled
2. AWS CLI version 2 installed on your development machine
3. An AWS Amplify app connected to your Git repository

## Step 1: Set Up AWS SSO for Local Development

1. Configure AWS SSO in your AWS account (if not already done)
2. Create permission sets with necessary permissions:
   - AmazonSageMakerFullAccess
   - AmazonBedrockFullAccess
   - Any other necessary permissions
3. Configure AWS CLI for SSO:
   \`\`\`bash
   aws configure sso
   \`\`\`
4. Follow the prompts to set up your SSO profile

## Step 2: Create an Amplify Service Role

For production deployment, create or use an Amplify service role:

1. Sign in to the AWS Management Console
2. Go to IAM → Roles
3. Look for an existing Amplify service role or create a new one
4. Attach policies for the required services:
   - AmazonSageMakerFullAccess
   - AmazonBedrockFullAccess
   - Any other necessary permissions
5. If creating a new role, use the Amplify service as the trusted entity

## Step 3: Configure Amplify Service Role

1. In the AWS Amplify console, go to your app
2. Go to **App settings** → **General**
3. Under **App access**, choose **Edit**
4. Enable **Service role**
5. Select the service role you created or identified in Step 2
6. Save your changes

## Step 4: Configure Amplify Environment Variables

In your Amplify app settings:

1. Go to **App settings** → **Environment variables**
2. Add the following variables:
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)
   - `AWS_PROFILE`: Your SSO profile name (for development environments only)

## Step 5: Update Your Application Code

The updated `aws-config.ts` file in this project handles both:
- Local development using AWS SSO
- Production deployment using Amplify service roles

## Step 6: Deploy to Amplify

1. Push your changes to your Git repository
2. Amplify will automatically build and deploy your application

## Troubleshooting

### Authentication Errors in Production

If you encounter authentication errors in the deployed application:

1. Check that the Amplify service role has the necessary permissions
2. Verify that the service role is correctly configured in Amplify
3. Check Amplify's build and deployment logs for specific error messages

### Local Development Issues

If you have issues with local development:

1. Ensure your SSO token is valid: `aws sso login --profile your-profile`
2. Check that the AWS_PROFILE environment variable is set correctly
3. Verify that your SSO permission set includes all necessary permissions

### Amplify Build Failures

If your Amplify build fails:

1. Check the build logs for specific error messages
2. Verify that all required dependencies are installed
3. Ensure your `amplify.yml` file is correctly configured
4. Check that your Next.js configuration is compatible with Amplify
