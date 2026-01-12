# AWS Amplify Environment Variables Setup

This guide explains how to configure environment variables for the Service Management Portal in AWS Amplify, specifically for Resend email integration.

## Required Environment Variables

You need to set the following environment variables in your Amplify app:

### 1. `RESEND_API_KEY` (Required)

- **Description**: Your Resend API key for sending emails
- **How to get it**:
  1. Sign up at [resend.com](https://resend.com)
  2. Go to API Keys section in your dashboard
  3. Create a new API key
  4. Copy the key (starts with `re_`)
- **Example**: `re_1234567890abcdefghijklmnopqrstuvwxyz`

### 2. `RESEND_FROM_EMAIL` (Optional)

- **Description**: The "from" email address for sent emails
- **Default**: `Service Network <onboarding@resend.dev>` (if not set)
- **Note**: Must be a verified domain in Resend, or use Resend's default domain
- **Example**: `Service Network <noreply@yourdomain.com>`

## Setting Environment Variables in AWS Amplify

### Method 1: Via Amplify Console (Recommended)

1. **Navigate to your Amplify App**:

   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Select your app

2. **Open Environment Variables**:

   - In the left sidebar, click **"App settings"**
   - Click **"Environment variables"**

3. **Add Variables**:

   - Click **"Manage variables"**
   - Click **"Add variable"** for each variable:
     - **Key**: `RESEND_API_KEY`
     - **Value**: Your Resend API key (paste from Resend dashboard)
     - Click **"Save"**
   - Repeat for `RESEND_FROM_EMAIL` if you want to customize it

4. **Redeploy**:
   - After adding variables, Amplify will automatically trigger a new build
   - Or manually trigger a redeploy from the "Deployments" tab

### Method 2: Via AWS CLI

```bash
# Set RESEND_API_KEY
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables RESEND_API_KEY=re_your_api_key_here

# Set RESEND_FROM_EMAIL (optional)
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables RESEND_FROM_EMAIL="Service Network <noreply@yourdomain.com>"
```

### Method 3: Via Amplify Console API

You can also use the AWS Console to set environment variables programmatically.

## Verification

After setting the environment variables:

1. **Trigger a new deployment** (if not automatic)
2. **Test the email functionality**:
   - Create a new service via Quick Start
   - Enter your email address
   - Complete the flow to trigger email sending
   - Check your inbox for the preview packet

## Troubleshooting

### Email not sending?

1. **Check API Key**:

   - Verify `RESEND_API_KEY` is set correctly in Amplify
   - Ensure the key is active in Resend dashboard
   - Check for typos or extra spaces

2. **Check Resend Dashboard**:

   - Go to Resend dashboard → Logs
   - Look for any error messages
   - Verify your domain is verified (if using custom domain)

3. **Check Amplify Logs**:

   - Go to Amplify Console → Your App → Monitoring
   - Check function logs for API route errors
   - Look for error messages in the logs

4. **Verify Environment Variables**:
   - In Amplify Console → App settings → Environment variables
   - Confirm variables are set and have correct values
   - Note: Variables are case-sensitive

### Common Errors

- **"Email service not configured"**: `RESEND_API_KEY` is missing or empty
- **"Failed to send email"**: Check Resend API key validity and rate limits
- **"Invalid from address"**: Domain not verified in Resend, or using invalid format

## Resend Free Tier Limits

- **3,000 emails per month** (free tier)
- **100 emails per day** (free tier)
- Upgrade to paid plan for higher limits

## Security Notes

- **Never commit API keys to git**
- Environment variables in Amplify are encrypted at rest
- Use Amplify's environment variable management (not hardcoded values)
- Rotate API keys periodically for security

## Local Development

For local development, create a `.env.local` file in the project root:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Service Network <noreply@yourdomain.com>
```

**Steps to set up locally:**

1. **Get your Resend API key**:

   - Sign up at [resend.com](https://resend.com) (free account)
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

2. **Create `.env.local` file**:

   - In the project root directory
   - Add your API key: `RESEND_API_KEY=re_your_actual_key_here`
   - Optionally add `RESEND_FROM_EMAIL` if you have a verified domain

3. **Restart your dev server**:
   - Stop the current `pnpm dev` process (Ctrl+C)
   - Start it again: `pnpm dev`
   - Next.js will automatically load `.env.local`

**Note**: `.env.local` is already in `.gitignore` and should not be committed.

## Next Steps

1. Set up your Resend account and get API key
2. Add environment variables in Amplify Console
3. Redeploy your app
4. Test the email functionality
5. Monitor Resend dashboard for email delivery

For more information:

- [Resend Documentation](https://resend.com/docs)
- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
