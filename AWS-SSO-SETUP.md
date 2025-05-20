# Setting Up AWS SSO for Your Application

This guide explains how to set up and use AWS SSO (Single Sign-On) with your Retail Demand Forecasting application.

## Why Use AWS SSO?

AWS SSO provides several advantages over using access keys:

- **Enhanced Security**: No long-term credentials stored in your application
- **Simplified Access Management**: Centralized control of permissions
- **Automatic Rotation**: Credentials are automatically rotated
- **Audit Trail**: Better visibility into who is accessing your AWS resources

## Prerequisites

1. AWS Organizations must be set up for your AWS account
2. AWS SSO must be enabled in your organization
3. AWS CLI version 2 installed on your development machine

## Step 1: Configure AWS SSO in Your AWS Account

If you haven't already set up AWS SSO:

1. Sign in to the AWS Management Console as an administrator
2. Go to the AWS SSO console
3. Choose **Enable AWS SSO**
4. Follow the prompts to complete the setup

## Step 2: Create Permission Sets

1. In the AWS SSO console, go to **AWS accounts**
2. Select your AWS account
3. Choose **Assign users or groups**
4. Create a permission set with the necessary permissions:
   - AmazonSageMakerFullAccess
   - AmazonBedrockFullAccess
   - AmazonS3FullAccess (or more restricted permissions as needed)

## Step 3: Assign Users or Groups

1. After creating the permission set, choose **Assign users or groups**
2. Select the users or groups who need access
3. Choose the permission set you created
4. Complete the assignment

## Step 4: Configure AWS CLI for SSO

1. Open a terminal and run:
   \`\`\`bash
   aws configure sso
   \`\`\`

2. Follow the prompts:
   - Enter the SSO start URL (e.g., https://your-domain.awsapps.com/start)
   - Enter the SSO Region (e.g., us-east-1)
   - Choose the AWS account and permission set
   - Name the profile (e.g., "retail-forecasting")

3. This creates a profile in your `~/.aws/config` file

## Step 5: Update Environment Variables for Amplify

In the AWS Amplify console:

1. Go to **App settings** → **Environment variables**
2. Add the following variables:
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)
   - `AWS_PROFILE`: The profile name you created (e.g., "retail-forecasting")

## Step 6: Configure Amplify Service Role

For production deployments, you should use an Amplify service role:

1. In the AWS Amplify console, go to **App settings** → **General**
2. Under **App access**, choose **Edit**
3. Enable **Service role**
4. Create a new service role or use an existing one with the necessary permissions
5. Save your changes

## Step 7: Local Development

For local development:

1. Log in to AWS SSO:
   \`\`\`bash
   aws sso login --profile retail-forecasting
   \`\`\`

2. Set the AWS_PROFILE environment variable:
   \`\`\`bash
   export AWS_PROFILE=retail-forecasting
   \`\`\`

3. Run your application:
   \`\`\`bash
   npm run dev
   \`\`\`

## Troubleshooting

### Token Expiration

SSO tokens expire after a certain period. If you get authentication errors:

1. Run `aws sso login --profile retail-forecasting` to refresh your token
2. Restart your application

### Permission Issues

If you encounter "Access Denied" errors:

1. Verify that your permission set includes all necessary permissions
2. Check that your SSO user is assigned to the correct permission set
3. Ensure your application is using the correct AWS region

### Amplify Deployment Issues

If Amplify deployment fails with authentication errors:

1. Verify that the Amplify service role has the necessary permissions
2. Check that environment variables are correctly set
3. Review Amplify build logs for specific error messages
