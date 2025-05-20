# Deploying to AWS Amplify

This guide explains how to deploy the Retail Demand Forecasting application to AWS Amplify.

## Prerequisites

1. An AWS account with appropriate permissions
2. The AWS Amplify CLI installed (optional, but helpful)
3. Your code pushed to a Git repository (GitHub, GitLab, BitBucket, or AWS CodeCommit)

## Setup Steps

### 1. Set up your repository

Make sure your code is pushed to a Git repository. AWS Amplify can connect directly to:
- GitHub
- GitLab
- BitBucket
- AWS CodeCommit

### 2. Connect your repository to AWS Amplify

1. Sign in to the AWS Management Console and open the Amplify console
2. Choose "New app" → "Host web app"
3. Select your Git provider and follow the steps to connect your repository
4. Authorize AWS Amplify to access your repository
5. Select the repository and branch you want to deploy

### 3. Configure build settings

The included `amplify.yml` file in the root of your project will be automatically detected and used for build settings. However, you can review and modify these settings in the Amplify console if needed.

### 4. Add environment variables

You need to add the following environment variables in the Amplify Console:

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | The AWS region where your SageMaker resources are located |
| `AWS_ACCESS_KEY_ID` | AWS access key with permissions for SageMaker and Bedrock |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key corresponding to the access key |

**Important security note:** For production deployments, it's better to use IAM roles instead of access keys. Consider setting up a service role for Amplify that has the necessary permissions.

To add environment variables:
1. In your app in the Amplify Console, go to "App settings" → "Environment variables"
2. Add each variable and its value
3. Select "Apply to all branches" or specify which branches should use these variables

### 5. Deploy your application

1. Click "Save and deploy" in the Amplify Console
2. Amplify will build and deploy your application according to the settings in `amplify.yml`
3. Once deployment is complete, you can access your application at the provided Amplify URL

## Advanced Configuration

### Custom Domains

To use a custom domain:
1. Go to "App settings" → "Domain management"
2. Follow the steps to add and verify your domain

### Access Control

To restrict access to your app:
1. Go to "App settings" → "Access control"
2. Set up password protection or use Amazon Cognito for authentication

### Continuous Deployment

By default, Amplify will automatically deploy when you push changes to your connected branch. You can modify this behavior in the build settings.

## Troubleshooting

If you encounter build or deployment issues:
1. Check the build logs in the Amplify Console
2. Verify that all required environment variables are set
3. Ensure your IAM permissions are correctly configured
4. Check that your Next.js application builds successfully locally

## Using AWS Services

Since this application integrates with Amazon SageMaker and Amazon Bedrock, ensure that:
1. The IAM role or user has appropriate permissions for these services
2. The services are available in the same region as your Amplify app
3. Any SageMaker endpoints or models you reference are deployed and running
