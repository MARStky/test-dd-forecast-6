# Deploying the Retail Forecasting Application

This guide provides step-by-step instructions for deploying the Retail Forecasting application to AWS Amplify with all the necessary backend resources.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Git repository with your application code

## Step 1: Deploy AWS Resources

First, deploy the CloudFormation template to create all the necessary AWS resources:

\`\`\`bash
# Create an S3 bucket for CloudFormation templates (if you don't have one)
aws s3 mb s3://your-cloudformation-bucket-name

# Package the CloudFormation template
aws cloudformation package \
  --template-file cloudformation/retail-forecasting-stack.yaml \
  --s3-bucket your-cloudformation-bucket-name \
