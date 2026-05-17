# Deploy to GitHub Pages

This is a static site. It can be published from the repository root with GitHub Pages.

## Option A: GitHub Web UI

1. Create a new GitHub repository, for example `e-portfolio`.
2. Upload all files from `C:\Users\picha\Documents\e-Portfolio`.
3. Open `Settings > Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select branch `main` and folder `/root`.
6. Save. The published URL will be shown on the Pages settings screen.

## Option B: Git Remote

After creating a repository on GitHub:

```powershell
git remote add origin https://github.com/<username>/e-portfolio.git
git push -u origin main
```

Then enable Pages from `Settings > Pages`.
