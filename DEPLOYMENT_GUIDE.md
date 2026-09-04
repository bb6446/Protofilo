# 🚀 Production Deployment & Security Guide: GitHub & Netlify

This repository is fully configured for **continuous deployment (CI/CD)** on **GitHub** and **Netlify** with serverless backend functions and Firebase Firestore CRM integration.

---

## 1. Connect and Push to GitHub

To push this repository to GitHub:

```bash
# 1. Initialize Git repository (if not already done)
git init

# 2. Add all project files
git add .

# 3. Create your commit
git commit -m "feat: MD Biplob 3D WebGL Portfolio with Serverless Security & Cloud CRM"

# 4. Set main branch
git branch -M main

# 5. Link remote GitHub repository
git remote add origin https://github.com/bb6446/Protofilo.git

# 6. Push code
git push -u origin main
```

---

## 2. Deploy to Netlify (Recommended)

### Automatic Deployment via GitHub (Continuous CI/CD)
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select **GitHub** and choose `MD_BIPLOB_3D_Portfolio_Website`.
4. Netlify will auto-detect settings from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Functions Directory**: `netlify/functions`
5. Configure Environment Variables under **Site configuration > Environment Variables**:

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | (Your Firebase Key) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `biplob-art` |
| `VITE_ADMIN_PIN` | Admin Master Passcode (Client build fallback) | Custom PIN |
| `VITE_ADMIN_PIN_HASH` | SHA-256 Hash of Admin Passcode | (Precalculated SHA-256) |
| `VITE_ADMIN_EMAIL` | Whitelisted Admin Google Email | `talukderbiplob498@gmail.com` |
| `ADMIN_PIN_HASH` | Serverless Function Passcode Hash | (For Netlify Functions) |
| `SESSION_SECRET` | HMAC Token Secret Key | 32+ char random string |

6. Click **"Deploy Site"**.

---

## 3. Serverless Backend Functions

The repository includes serverless Netlify Functions under `netlify/functions/`:
- `submit-inquiry.js`: Provides server-side email validation, input sanitization, IP-based rate limiting (5 inquiries/min), and Firestore persistence.
- `admin-auth.js`: Verifies admin authentication using constant-time hash comparison and issues signed HMAC session tokens.

---

## 4. Firestore Security Rules

To secure your Cloud Firestore database in production, apply these rules in the [Firebase Console](https://console.firebase.google.com/):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public contact inquiries: Anyone can create; only authenticated admin can read/update
    match /messages/{messageId} {
      allow create: if request.resource.data.keys().hasAll(['senderName', 'senderEmail', 'projectType'])
                    && request.resource.data.senderName is string
                    && request.resource.data.senderEmail is string;
      allow read, update, delete: if request.auth != null;
    }
    
    // Portfolio projects, skills, settings: Public read; authenticated admin write
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /skills/{skillId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. Admin Access

- **Admin Portal URL**: `https://your-domain.netlify.app/#admin` or click **`ADMIN PORTAL`** in the footer.
- **Google Sign-In**: Whitelisted to the authorized owner email configured in `VITE_ADMIN_EMAIL`.
- **Passcode Authentication**: Validated against serverless hash verification or environment passcode.
