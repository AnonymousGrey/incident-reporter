# Emergency Incident Reporter 🚨

A lightweight, production-ready web application for reporting emergencies and incidents with automatic location tracking and Google Sheets integration.

## ✨ Features

- 📱 Simple, mobile-responsive interface
- 🌍 Automatic GPS location capture
- 📊 Auto-submit incident data to Google Sheets
- 🎨 Beautiful gradient UI with Tailwind CSS
- 🌐 Bilingual support (English & Hindi)
- ⚡ Lightning-fast deployment on Vercel
- 🔒 Secure API routes
- 📝 Four incident types: Medical, Vehicle Accident, Fire, Others

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git
- Google Cloud Project with Sheets API enabled

### 2. Installation

```bash
# Install dependencies
npm install

# Create environment variables
cp .env.local.example .env.local
```

### 3. Google Sheets Setup

You have two options for Google Sheets integration:

#### Option A: Service Account (Recommended for Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "Credentials" → "Create Credentials" → "Service Account"
   - Create a JSON key file
   - Download and save the credentials
5. Share your Google Sheet with the service account email
6. Add environment variables to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key_here
GOOGLE_PRIVATE_KEY_ID=your_key_id
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_ID=your_client_id
```

#### Option B: API Key (Simpler, for Public Sheets)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Sheets API
3. Create an API Key under Credentials
4. Make sure your Google Sheet has "Viewer" access for "Anyone with the link"
5. Add to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=1G-QaM8dvpgKzY5rbsmtbiYmve8z3VBbml1A96oxo5lE
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### 4. Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### 5. Deployment on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables during deployment:
# - NEXT_PUBLIC_GOOGLE_SHEET_ID
# - GOOGLE_SERVICE_ACCOUNT_EMAIL (if using service account)
# - GOOGLE_PRIVATE_KEY (if using service account)
# - GOOGLE_SHEETS_API_KEY (if using API key)
```

Or connect your Git repository to Vercel dashboard and it will auto-deploy.

## 📁 Project Structure

```
├── pages/
│   ├── _app.tsx              # App wrapper
│   ├── index.tsx             # Home page
│   └── api/
│       └── submit-incident.ts # API route for incident submission
├── components/
│   ├── IncidentModal.tsx      # Incident type selector
│   └── SuccessMessage.tsx     # Success notification
├── lib/
│   └── geolocation.ts         # Location utility
├── styles/
│   └── globals.css            # Global Tailwind styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.local.example         # Environment template
```

## 🔧 How It Works

1. **User opens the app** → See the main page with "Report an Incident" button
2. **Clicks button** → Modal opens with 4 incident type options
3. **Selects incident type** → App requests location permission
4. **Submits** → Sends incident data + coordinates to backend API
5. **API receives request** → Appends data to Google Sheet
6. **Success feedback** → User sees confirmation message

## 📊 Google Sheet Format

Your sheet should have these columns:
```
A: Timestamp (ISO format)
B: Incident Type
C: Latitude
D: Longitude
```

Example:
```
2024-03-23T10:30:45.000Z | fire | 28.7041° | 77.1025°
```

## 🌐 Browser Support

- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅ (iOS 14.5+, Android 10+)

⚠️ HTTPS required for geolocation on production (automatic on Vercel)

## 🛡️ Security Considerations

- Geolocation data is sent via HTTPS only
- API key is kept server-side (not exposed to client)
- Rate limiting recommended for production
- Use service accounts instead of API keys for sensitive environments

## 📱 Mobile Optimization

The app is fully responsive and mobile-first:
- Touch-friendly buttons
- Mobile keyboard handling
- Optimized for all screen sizes
- Native geolocation support

## ⚡ Performance

- Next.js automatic code splitting
- Optimized for Core Web Vitals
- Minimal dependencies
- ~50KB gzipped bundle size

## 🐛 Troubleshooting

### Geolocation not working
- Ensure HTTPS on production (Vercel does this automatically)
- Check browser permissions for location access
- Some browsers require user interaction before geolocation

### Google Sheets not updating
- Verify Sheet ID is correct
- Check environment variables are set
- Ensure service account has edit access to the sheet
- Check browser console and server logs for errors

### Vercel deployment issues
- Clear build cache: `vercel env pull`
- Check that all env variables are set in Vercel dashboard
- Review build logs in Vercel dashboard

## 📄 License

MIT

## 👤 Support

For issues or questions, please contact the development team.

---

**Made with ❤️ for Emergency Response Systems**
