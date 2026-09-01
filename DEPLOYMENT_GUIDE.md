# 🚀 Deployment Guide: GitHub & Netlify

This repository is fully configured for **continuous deployment (CI/CD)** on **GitHub** and **Netlify**.

---

## 1. Connect and Push to GitHub

If you have Git installed on your machine, run these commands in your project terminal:

```bash
# 1. Initialize Git repository
git init

# 2. Add all project files
git add .

# 3. Create your first commit
git commit -m "feat: MD Biplob 3D WebGL Portfolio with Admin Control Hub & Firebase CRM"

# 4. Rename default branch to main
git branch -M main

# 5. Link your remote GitHub repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 2. Deploy to Netlify (Recommended)

### Option A: Automatic Deployment via GitHub (Continuous CI/CD)
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select **GitHub** and authorize your account.
4. Choose this repository (`MD_BIPLOB_3D_Portfolio_Website`).
5. Netlify will auto-detect the configuration from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. (Optional) Under **Site configuration > Environment Variables**, add your Firebase keys:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_STORAGE_BUCKET`
7. Click **"Deploy Site"**. Your site is now live!
8. Netlify handles the `/admin` and SPA routing automatically via `public/_redirects`.

### Option B: Netlify CLI Manual Deploy
```bash
npx netlify-cli deploy --prod --dir=dist
```

---

## 3. GitHub Pages Deployment (Free Alternative)

The repository includes a ready-to-use GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Go to your GitHub repository on github.com.
2. Navigate to **Settings** > **Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Every time you push to `main`, GitHub Actions will build and deploy your site automatically!

---

## 4. Admin Access & Authentication
- **Admin URL**: `https://your-domain.netlify.app/#admin` or click **`ADMIN PORTAL`** in the footer.
- **Google Sign-In Account**: `talukderbiplob498@gmail.com`
- **Master Passcode PIN**: `2026`
