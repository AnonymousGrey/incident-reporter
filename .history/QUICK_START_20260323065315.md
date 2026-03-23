# 🚀 Quick Start Guide

Get your Emergency Incident Reporter running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- A Google Cloud account (free)

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Get Google Credentials (2 min)

**Fastest option - Use API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google Sheets API"
4. Go to Credentials → Create API Key
5. Copy the API key

**Or - Use Service Account (Recommended):**

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for detailed instructions.

## Step 3: Configure Environment (1 min)

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your credentials
# nano .env.local  (or use your editor)
```

For API Key method, you only need:
```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

## Step 4: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test It! (1 min)

1. Click "Report an Incident" button
2. Select incident type
3. Allow location access
4. Check your Google Sheet - new data should appear!

## 📊 Verify Data in Google Sheet

Open your Google Sheet:
https://docs.google.com/spreadsheets/d/1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE/edit

You should see new rows with:
- **Column A**: Timestamp (ISO format)
- **Column B**: Incident Type (medical, vehicle, fire, others)
- **Column C**: Latitude
- **Column D**: Longitude

## 🌐 Deploy to Vercel

When ready to go live:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time)
vercel link

# Add environment variables when prompted
# Then deploy to production
vercel --prod
```

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed steps.

## 📁 Project Structure

```
├── pages/              # Application pages
│   ├── index.tsx       # Main home page
│   └── api/
│       └── submit-incident.ts  # Backend API
├── components/         # React components
├── lib/               # Utility functions
├── styles/            # CSS (Tailwind)
├── public/            # Static files
└── .env.local         # Your credentials (not in git!)
```

## 🐛 Troubleshooting

### Geolocation not asking for permission?
- Make sure you're on HTTPS (local `http://localhost:3000` is OK)
- Check browser console for errors
- In browser settings, allow location access

### Google Sheet not updating?
- Check `.env.local` has correct values
- Verify API key is enabled in Google Cloud
- Make sure Google Sheets API is enabled
- Check browser console and terminal for error messages

### Build errors?
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## 📞 Need Help?

1. Check [README.md](./README.md) for complete documentation
2. See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for Google configuration
3. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for deployment
4. Check browser console for error messages (F12 → Console)

## ✅ Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Google credentials configured (API key or Service Account)
- [ ] `.env.local` created and filled
- [ ] Dev server running (`npm run dev`)
- [ ] App loads at http://localhost:3000
- [ ] Can select incident type without errors
- [ ] Location permission works
- [ ] Data appears in Google Sheet

## 🎉 Ready to Deploy?

Once testing is complete locally:

```bash
# Verify production build works
npm run build
npm start

# When ready, deploy to Vercel
npm i -g vercel
vercel --prod
```

Your live app URL: `https://your-project-name.vercel.app`

---

**That's it!** Your Emergency Incident Reporter is ready. 🚨

Need to customize?
- Change colors in `tailwind.config.js`
- Edit incident types in `components/IncidentModal.tsx`
- Modify the UI in `pages/index.tsx`

Questions? Check the documentation files provided!
