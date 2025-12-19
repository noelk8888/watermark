# How to Deploy Watermark Studio to Vercel

Since your code is already pushed to GitHub, expanding it to Vercel is very easy.

## Step 1: Log in to Vercel
1. Go to [vercel.com](https://vercel.com).
2. Log in (or Sign Up) using your **GitHub** account.

## Step 2: Add New Project
1. On your Vercel Dashboard, click the **"Add New..."** button and select **"Project"**.
2. You should see a list of your GitHub repositories.
3. Find `watermark` and click the **"Import"** button next to it.

## Step 3: Configure Project
**Important**: Since your app lives inside a folder, you need to tell Vercel where to look.

1. **Project Name**: You can leave this as `watermark` or change it to `watermark-studio`.
2. **Framework Preset**: Vercel should automatically detect **Vite**. If not, select "Vite" from the dropdown.
3. **Root Directory**:
   - Click **"Edit"** next to **Root Directory**.
   - Select the `watermark-studio` folder.
   - Click **"Continue"**.

## Step 4: Deploy
1. Click **"Deploy"**.
2. Vercel will now download your code, run `npm install`, and `npm run build`.
3. Wait about a minute. Once finished, you will see a "Congratulations!" screen with a link to your live app!

## Future Updates
Because you connected it to GitHub, every time you run `git push`, Vercel will automatically re-deploy your new changes!
