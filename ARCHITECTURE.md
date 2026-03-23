# 🏗️ Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Frontend (pages/index.tsx)                    │   │
│  │  - Main page with "Report Incident" buttons          │   │
│  │  - Incident type modal (IncidentModal)               │   │
│  │  - Success message notification                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                     │
│              Geolocation API │ (browser native)              │
│                         │                                     │
└─────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
         HTTP POST                  GET
      /api/submit-incident     Coordinates
              │                       │
         Latitude    ◄────────────────┘
         Longitude
              │
┌─────────────▼────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Route (pages/api/submit-incident.ts)            │   │
│  │  - Receives incident data + coordinates              │   │
│  │  - Validates data                                    │   │
│  │  - Gets Google access token                          │   │
│  │  - Appends row to Google Sheet                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Authentication (lib/google-auth.ts)                │   │
│  │  - JWT generation from service account              │   │
│  │  - Token caching (1 hour)                           │   │
│  │  - Token refresh handling                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              │
              │ HTTPS
         API v4
              │
┌─────────────▼────────────────────────────────────────────────┐
│           GOOGLE SHEETS API (googleapis.com)                  │
│  - Append endpoint: /spreadsheets/{id}/values/Sheet1:append  │
│  Returns: Success/Error response with update details         │
└─────────────────────────────────────────────────────────────┘
              │
              │ OAuth 2.0 Bearer Token
              │
┌─────────────▼────────────────────────────────────────────────┐
│         GOOGLE SHEETS DATABASE                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Sheet1                                               │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ A: Timestamp  │ B: Type  │ C: Lat  │ D: Long      │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 2024-03-23T10:30:45.000Z │ Medical │ 28.70 │ 77.10 │   │
│  │ 2024-03-23T10:45:20.000Z │ Fire    │ 28.71 │ 77.11 │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Interaction
```
User Opens App
    ↓
Shows Main Page with Bilingual Buttons (English + Hindi)
    ↓
User Clicks "Report an Incident"
    ↓
Modal Opens with 4 Incident Type Options
    ↓
User Selects Incident Type
```

### 2. Location Acquisition
```
Browser Geolocation API Request
    ↓
Browser Asks User Permission
    ↓
User Grants Permission
    ↓
Coordinates Captured (Latitude, Longitude, Accuracy)
```

### 3. Data Submission
```
POST Request to /api/submit-incident
  - Headers: Content-Type: application/json
  - Body: { incidentType, latitude, longitude }
    ↓
Backend Validates Data
    ↓
Gets Google Access Token (JWT + OAuth2)
    ↓
Calls Google Sheets API (append endpoint)
  - Authorization: Bearer {token}
  - Values: [timestamp, incidentType, latitude, longitude]
    ↓
Google Sheets Appends New Row
    ↓
Success Response to Frontend
    ↓
User Sees Success Message
```

## Component Architecture

### Frontend Components

#### `pages/index.tsx` (Main Page)
- **Purpose**: Home page with incident reporting buttons
- **State**:
  - `isModalOpen`: Boolean for modal visibility
  - `isLoading`: Boolean for submission in progress
  - `showSuccess`: Boolean for success message
  - `errorMessage`: String for error display
- **Functions**:
  - `handleReportClick()`: Opens modal
  - `handleIncidentSelect()`: Handles incident type selection

#### `components/IncidentModal.tsx`
- **Purpose**: Modal dialog for selecting incident type
- **Props**:
  - `isOpen: boolean` - Controls visibility
  - `onClose: () => void` - Close handler
  - `onSelect: (type: string) => Promise<void>` - Selection handler
  - `isLoading: boolean` - Disable buttons during submission
- **Features**:
  - 4 incident type buttons with emojis
  - Responsive grid layout
  - Hover effects

#### `components/SuccessMessage.tsx`
- **Purpose**: Success notification toast
- **Props**:
  - `isVisible: boolean` - Show/hide
  - `message: string` - Message text
  - `onDismiss: () => void` - Close handler
- **Features**:
  - Auto-dismisses after 3 seconds
  - Fixed position (top-right)
  - Animated entrance

### Utility Modules

#### `lib/geolocation.ts`
- **Purpose**: Browser geolocation wrapper
- **Exports**:
  - `Location` interface - Coordinates with accuracy
  - `getLocation()` - Promise-based geolocation API
- **Details**:
  - High accuracy requested
  - 10 second timeout
  - Error handling with user-friendly messages

#### `lib/google-auth.ts`
- **Purpose**: Google OAuth2 authentication
- **Exports**:
  - `getAccessToken()` - Returns valid access token
- **Features**:
  - JWT generation from service account
  - Token caching (1 hour)
  - Automatic refresh before expiry
  - No external dependencies (uses Node.js crypto)

### Backend API Routes

#### `pages/api/submit-incident.ts`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "incidentType": "medical|vehicle|fire|others",
    "latitude": 28.7041,
    "longitude": 77.1025
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Incident reported successfully"
  }
  ```
- **Error Handling**:
  - 405: Method not allowed
  - 400: Missing required fields
  - 500: Server error (Google API, auth, etc.)

## Technology Stack

### Frontend
- **React 18**: UI library
- **Next.js 14**: React framework + routing
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Axios** (optional): HTTP client (uses fetch instead)

### Backend
- **Next.js API Routes**: Serverless functions
- **Node.js crypto**: JWT signing
- **Native fetch**: HTTP requests

### External Services
- **Google Sheets API v4**: Data storage
- **Google OAuth 2.0**: Authentication
- **Geolocation API**: Browser location

### Deployment
- **Vercel**: Hosting platform
- **Git**: Version control

## File Sizes & Performance

```
Development Build:
├── JavaScript (Next.js): ~200KB
├── CSS (Tailwind): ~50KB
└── Fonts & Icons: Embedded

Production (Optimized):
├── Main bundle: ~45KB gzipped
├── CSS bundle: ~8KB gzipped
└── Total: ~53KB gzipped ✅ Very Lightweight

Load Times:
├── First Page Load: 1-2 seconds
├── API Response Time: 200-500ms
└── Google Sheets Update: 1-2 seconds
```

## Environment Variables

### Required Variables

| Variable | Source | Used In |
|----------|--------|---------|
| `NEXT_PUBLIC_GOOGLE_SHEET_ID` | Google Cloud | Frontend & API |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account JSON | API auth |
| `GOOGLE_PRIVATE_KEY` | Service Account JSON | lib/google-auth.ts |
| `GOOGLE_PRIVATE_KEY_ID` | Service Account JSON | JWT header |
| `GOOGLE_PROJECT_ID` | Service Account JSON | Credentials |
| `GOOGLE_CLIENT_ID` | Service Account JSON | Credentials |

### Optional Variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEETS_API_KEY` | Alternative for public sheets |

## Security Architecture

```
┌─────────────────────────────────┐
│  Browser (User)                 │
│  - Can only see public data     │
│  - No API keys exposed          │
│  - Location encrypted via HTTPS │
└──────────────┬──────────────────┘
               │ HTTPS Only
               │
┌──────────────▼──────────────────┐
│  Vercel Server (Protected)       │
│  - API keys stored securely      │
│  - Private keys never exposed    │
│  - Backend logic hidden          │
│  - Environment variables         │
│    encrypted at rest             │
└──────────────┬──────────────────┘
               │ OAuth 2.0
               │ Bearer Token
               │
┌──────────────▼──────────────────┐
│  Google Sheets API               │
│  - Authenticated requests only   │
│  - Service account identity      │
│  - Edit access to sheet          │
└─────────────────────────────────┘
```

## API Authentication Flow

```
1. Request arrives at /api/submit-incident
   ↓
2. Check environment variables configured
   ↓
3. Build JWT (JSON Web Token):
   - Header: { alg: 'RS256', typ: 'JWT' }
   - Payload: {
       iss: service_account_email,
       scope: sheets_api_scope,
       aud: token_uri,
       exp: now + 1hour,
       iat: now
     }
   ↓
4. Sign JWT with private key (RS256 algorithm)
   ↓
5. Exchange JWT for access token:
   POST https://oauth2.googleapis.com/token
   Body: grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
         assertion=JWT
   ↓
6. Receive access token (valid for 1 hour)
   ↓
7. Use token to authenticate Google Sheets API call:
   Authorization: Bearer {access_token}
   ↓
8. Cache token for subsequent requests (8)
   ↓
9. Next request reuses cached token (if valid)
```

## Error Handling

### Frontend Errors
- Geolocation denied → Alert user
- Network error → Alert user
- Missing data → Validation error

### Backend Errors
- Missing credentials → 500 Error
- Google API error → 500 Error
- Invalid sheet ID → 500 Error

### Google API Errors
- Authentication failure → Retry with new token
- Invalid sheet → Return 500
- Rate limited → Implement backoff

## Scalability Considerations

### Current Limitations
- Single sheet (no sharding)
- No rate limiting (could add)
- No logging/analytics (could add)

### To Scale to 1000+ submissions/day
- Add rate limiting on API endpoint
- Implement request queuing if needed
- Monitor Google Sheets API quotas
- Consider batching multiple rows

### To Scale to 1M+ submissions/day
- Migrate data to proper database (Firestore, MongoDB)
- Use message queue (Cloud Pub/Sub, Kafka)
- Implement proper logging (Cloud Logging)
- Add monitoring & alerting (Datadog, New Relic)

## Customization Points

### Easy to Customize
1. **Incident Types**: Edit `components/IncidentModal.tsx`
2. **Colors/Theme**: Edit `tailwind.config.js` and `styles/globals.css`
3. **UI Text**: Edit `pages/index.tsx` (English and Hindi)
4. **Google Sheet Format**: Edit `pages/api/submit-incident.ts` (column order)

### Harder to Customize
1. **Authentication**: Would need different auth method
2. **Data Storage**: Replace Google Sheets with database
3. **API Response**: Add custom fields beyond incident data

---

## Development Notes

### For Adding Features
1. Frontend changes: Edit React components
2. API changes: Edit `pages/api/submit-incident.ts`
3. Utility changes: Edit `lib/` files
4. Styling changes: Edit Tailwind config or CSS

### For Debugging
1. **Frontend**: Browser DevTools (F12)
2. **API**: Check Vercel function logs
3. **Google Auth**: Check console logs and test JWT generation
4. **Network**: Check Network tab in DevTools

### Testing Locally
```bash
# Test frontend
npm run dev
# Open http://localhost:3000
# Click through the flow

# Test API directly (after allowing geolocation)
# Browser console:
fetch('/api/submit-incident', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    incidentType: 'medical',
    latitude: 28.7041,
    longitude: 77.1025
  })
}).then(r => r.json()).then(console.log)
```

---

This architecture is designed for simplicity, performance, and reliability. All components are stateless (except caching) and can handle high concurrency on Vercel's serverless platform.
