# Vercel Deployment Guide

## 🎯 Quick Deploy (5 minutes)

### Option 1: Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Select your repository
5. Accept default settings, click "Deploy"
6. Go to Project Settings → Environment Variables
7. Add your Google Sheets credentials
8. Redeploy

### Option 2: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod

# Add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_PRIVATE_KEY_ID
vercel env add GOOGLE_PROJECT_ID
vercel env add GOOGLE_CLIENT_ID

# Redeploy with environment variables
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [ ] `.env.local.example` created with sample keys
- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] No secrets committed in git history
- [ ] `package.json` has all required dependencies
- [ ] `next.config.js` is properly configured
- [ ] Tailwind CSS compilation tested locally
- [ ] Geolocation tested in development
- [ ] Google Sheets submission tested locally
- [ ] All environment variable names documented
- [ ] Google Sheet is shared with service account

## 🔐 Environment Variables for Vercel

Add these in Vercel Dashboard under Project Settings → Environment Variables:

| Variable | Value | Type |
|----------|-------|------|
| `NEXT_PUBLIC_GOOGLE_SHEET_ID` | Your Sheet ID | Public |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | Secret |
| `GOOGLE_PRIVATE_KEY` | Private key (with literal `\n`) | Secret |
| `GOOGLE_PRIVATE_KEY_ID` | Key ID | Secret |
| `GOOGLE_PROJECT_ID` | Your GCP project ID | Secret |
| `GOOGLE_CLIENT_ID` | Client ID from JSON | Secret |

⚠️ **Mark sensitive variables as "Secret"** so they're encrypted

## 🚀 Deployment Steps

### Step 1: Prepare Repository

```bash
# Clone or navigate to your repo
cd "Location & Response Fetcher"

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Emergency incident reporter app"

# Push to GitHub (create repo first at github.com)
git remote add origin https://github.com/YOUR_USERNAME/incident-reporter.git
git branch -M main
git push -u origin main
```

### Step 2: Add Environment Variables to Vercel

**Via Dashboard:**
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add each variable
4. Save

**Example GOOGLE_PRIVATE_KEY format:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...rest of the key...
-----END PRIVATE KEY-----
```

### Step 3: Redeploy

```bash
vercel --prod --yes
```

Or trigger redeploy from Vercel dashboard by clicking "Redeploy"

## ✅ Verification

After deployment:

1. **Check deployment URL**: Vercel automatically provides a URL like `https://incident-reporter-xyz.vercel.app`
2. **Test the app**:
   - Open the URL in browser
   - Click "Report an Incident"
   - Select an incident type
   - Grant location permission
   - Check Google Sheet for new data
   - Should see timestamp and coordinates

3. **Check logs** in Vercel dashboard:
   - Functions → select `/api/submit-incident`
   - Look for successful API calls

## 🐛 Debugging Deployment Issues

### Build fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing dependencies: npm install
# - TypeScript errors: npx tsc --noEmit
# - Environment vars not loaded: check spelling
```

### App loads but nothing submits

1. Check Network tab in browser DevTools
2. Verify API response (should be 200)
3. Check function logs in Vercel dashboard
4. Verify Google Sheets API is enabled
5. Check service account has sheet access

### Geolocation not working

- Vercel provides HTTPS automatically ✅
- Browser security restrictions:
  - HTTPS required ✅ (on Vercel)
  - User permission required (your app asks for this)
  - Some browsers block in incognito mode

## 📊 Performance Tips

- Vercel automatically optimizes Next.js
- Your bundle is ~50KB gzipped ✅ (very lightweight)
- Uses edge functions for API routes
- First page load: ~1-2 seconds
- API response: ~200-500ms (depends on Google Sheets API)

## 🔒 Security on Vercel

- Environment variables encrypted at rest ✅
- Secrets only exposed to backend (API routes) ✅
- HTTPS enforced ✅
- No client-side API keys ✅

## 📱 Custom Domain (Optional)

1. Buy domain from registrar (Namecheap, GoDaddy, etc.)
2. In Vercel dashboard → Domains
3. Add custom domain
4. Update DNS records (Vercel provides instructions)
5. DNS propagates in 24 hours

Example: `incident.yourdomain.com`

## 🔄 Continuous Deployment

Once linked to GitHub, every push to main automatically deploys:

```bash
git add .
git commit -m "Fix: improve error handling"
git push origin main  # Auto-deploys to Vercel!
```

To preview before merging:
- Push to feature branch
- Vercel auto-creates preview deployment
- Share preview URL for review
- Merge to main when ready

## 📞 Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- Vercel Support: help.vercel.com

## 🎉 You're Live!

Your app is now live on Vercel! 🚀

Share your deployment URL with team members. Users can now:
- Report incidents from any device
- Location automatically captured
- Data saved to Google Sheet in real-time

---

**Pro Tips:**
- Set up monitoring/alerts for API errors
- Regularly review submitted data
- Add rate limiting if needed
- Consider backup Google Sheet as failsafe
