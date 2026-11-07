# Pokésearch

A browser edition of the Windows moveset lookup. Select a game, species, form and level to display up to four predicted level-up moves. Use the gender selector for Meowstic and Indeedee. Pokémon and level start blank. Game selection and dark mode are saved in the browser.

## Publish with GitHub Pages

1. Create a public repository named `pokesearch` in your GitHub account.
2. Extract the ZIP. Open the folder containing `index.html`. On GitHub choose **Add file → Upload files** and drag the **contents** of that folder into the upload area, including the `assets` and `credits` folders. Commit to `main`. Verify `index.html` appears at the repository root.
3. In **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose **main** and **/(root)**, then save.
4. Once deployment finishes, open **Visit site** in the Pages settings. The usual address is `https://YOUR-USERNAME.github.io/pokesearch/`.

For local development, run `python -m http.server 8000` in the folder containing index.html and open http://localhost:8000/. JavaScript modules and data loading require an HTTP server.

## Data and offline access

The scripts, database and sprites ship together. After the first successful visit and service-worker cache installation, this browser can reopen the site offline. Clearing site storage removes that copy. Ordinary lookups run locally. Learnsets and coverage follow the desktop dataset, including its gaps for newer games. Predictions exclude trainer-specific moves and previous evolution history.

The source data commit is in assets/database.json. The sprite sheets preserve the original 96×96 images. Credits and notices are in credits/. When updating any cached asset, change the cache version in sw.js so browsers install the new files.
