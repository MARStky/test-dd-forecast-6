# Setting Up AWS SSO with Vercel Deployment

This guide explains how to use AWS SSO authentication with your application deployed on Vercel.

## Overview

When deploying to Vercel, there are two authentication approaches:

1. **Local Development**: Uses AWS SSO with your local AWS profile
2. **Production Deployment**: Uses Vercel's environment variables with AWS IAM roles

## Prerequisites

1. AWS Organizations and AWS SSO enabled
2. AWS CLI version 2 installed on your development machine
3. A Vercel account connected to your GitHub repository

## Step 1: Set Up AWS SSO for Local Development

1. Configure AWS SSO in your AWS account (if not already done)
2. Create permission sets with necessary permissions
3. Configure AWS CLI for SSO:
   \`\`\`bash
   aws configure sso
   \`\`\`
4. Follow the prompts to set up your SSO profile

## Step 2: Create an IAM Role for Vercel

For production deployment, create an IAM role that Vercel can assume:

1. Sign in to the AWS Management Console
2. Go to IAM → Roles → Create role
3. Select "Web identity" as the trusted entity
4. For Identity Provider, you can use AWS Cognito or create a custom OIDC provider for Vercel
5. Attach policies for the required services:
   - AmazonSageMakerFullAccess
   - AmazonBedrockFullAccess
   - Any other necessary permissions
6. Name the role (e.g., "VercelSageMakerRole") and create it
7. Note the Role ARN for the next step

## Step 3: Configure Vercel Environment Variables

In your Vercel project settings:

1. Go to Settings → Environment Variables
2. Add the following variables:
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)
   - `AWS_PROFILE`: Your SSO profile name (for development)
   - `AWS_ROLE_ARN`: The ARN of the IAM role you created (for production)
   - `AWS_ROLE_SESSION_NAME`: A name for the session (e.g., "vercel-deployment")

## Step 4: Update Your Application Code

The updated `aws-config.ts` file in this project handles both:
- Local development using AWS SSO
- Production deployment using Vercel's environment variables

## Step 5: Deploy to Vercel

1. Push your changes to your GitHub repository
2. Connect your repository to Vercel if you haven't already
3. Deploy your application

## Troubleshooting

### Authentication Errors in Production

If you encounter authentication errors in the deployed application:

1. Check that the IAM role has the necessary permissions
2. Verify that all environment variables are correctly set in Vercel
3. Check Vercel's function logs for specific error messages

### Local Development Issues

If you have issues with local development:

1. Ensure your SSO token is valid: `aws sso login --profile your-profile`
2. Check that the AWS_PROFILE environment variable is set correctly
3. Verify that your SSO permission set includes all necessary permissions
