# Google Sheets Integration Setup Guide

## Complete Setup Instructions

### Step 1: Create/Use Your Google Sheet

The sheet you provided is already available:
- **Sheet ID**: `1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE`
- **URL**: https://docs.google.com/spreadsheets/d/1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE/edit?usp=sharing

**Make sure the first sheet is named "Sheet1"** (or update the API route accordingly)

### Step 2: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 3: Create Service Account (Recommended)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Service account name: `incident-reporter`
   - Click "Create and Continue"
4. Grant permissions (optional):
   - Skip this step
5. Go to "Keys" tab:
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Click "Create"
   - The JSON file will download automatically
6. Open the JSON file and copy these values to `.env.local`:
   ```json
   {
     "type": "service_account",
     "project_id": "YOUR_PROJECT_ID",
     "private_key_id": "YOUR_PRIVATE_KEY_ID",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "SERVICE_ACCOUNT_EMAIL",
     ...
   }
   ```

### Step 4: Share Sheet with Service Account

1. Copy the `client_email` from your service account JSON
2. Go to your Google Sheet
3. Click "Share" button
4. Paste the service account email
5. Give it "Editor" access
6. Uncheck "Notify people" to avoid sending notifications to a robot account
7. Click "Share"

### Step 5: Configure Environment Variables

Create `.env.local` file in project root:

```env
# Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEET_ID=1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE

# Service Account Method (Recommended)
GOOGLE_SERVICE_ACCOUNT_EMAIL=incident-reporter@YOUR_PROJECT.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_PRIVATE_KEY_ID=your_key_id_here
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_ID=your_client_id

# OR API Key Method (Alternative - for public sheets only)
# GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE
```

**Important**: 
- Keep `.env.local` secure - never commit to git
- The `GOOGLE_PRIVATE_KEY` should include literal `\n` characters for newlines
- Never share these keys publicly

### Step 6: Format Your Google Sheet

Add headers to your sheet (Sheet1, Row 1):

| A | B | C | D |
|---|---|---|---|
| Timestamp | Incident Type | Latitude | Longitude |

Example data:
```
2024-03-23T10:30:45.000Z | Medical Emergency | 28.70 | 77.10
2024-03-23T10:45:20.000Z | Fire | 28.71 | 77.11
```

### Step 7: Local Testing

```bash
# Install dependencies
npm install

# Create .env.local with your credentials
cp .env.local.example .env.local
# ... edit .env.local with your keys ...

# Run development server
npm run dev

# Test at http://localhost:3000
```

### Step 8: Deploy to Vercel

#### Using Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Under "Environment Variables", add:
   - `GOOGLE_PRIVATE_KEY` (use multiline input)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY_ID`
   - `GOOGLE_PROJECT_ID`
   - `GOOGLE_CLIENT_ID`
6. Click "Deploy"

#### Using Vercel CLI

```bash
npm i -g vercel
vercel

# When prompted, add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
# ... continue for other variables ...

vercel --prod
```

### Troubleshooting

#### Error: "Google Sheet ID not configured"
- Check `.env.local` has `NEXT_PUBLIC_GOOGLE_SHEET_ID`
- Verify the Sheet ID matches your Google Sheet

#### Error: "Google API credentials not configured"
- Ensure service account variables are set
- Check for typos in environment variable names

#### Data not appearing in Sheet
- Verify service account has "Editor" access
- Check the sheet name is "Sheet1" (case-sensitive)
- Look at browser console and server logs for errors
- Ensure location permission was granted

#### Permission Denied when sharing file
- Use a different Google account to share
- Make sure you're the owner of the Google Sheet

## Security Best Practices

✅ **DO:**
- Use service accounts for production
- Keep private keys in environment variables only
- Use HTTPS (automatic on Vercel)
- Rotate API keys regularly
- Use separate project IDs for dev/prod

❌ **DON'T:**
- Commit `.env.local` to git (already in `.gitignore`)
- Share private keys in public repositories
- Use API keys in client-side code
- Deploy without HTTPS
- Share environment variables in Slack/email

## Monitoring

Monitor your sheet for:
- Unusual location data
- Duplicate submissions
- Data quality issues

Consider adding:
- Rate limiting on API route
- Logging/analytics
- Data validation
- Spam filters

---

Need help? Check the main README.md for more information.
