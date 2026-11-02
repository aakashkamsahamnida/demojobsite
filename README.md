# Mogus Jobs — static frontend starter

A responsive job-portal demo built with **HTML, CSS, and vanilla JavaScript**. It is designed to be easy to push to GitHub and publish with GitHub Pages.

## Pages / sections included
This first version is a **single-page site with navigation links** to all four requested areas:
- Home / landing page
- Applicant job search with keyword, location, employment type, work arrangement, experience and salary filters; sorting; saved-job toggles
- Recruiter job-posting form
- Recruiter posting history with edit, delete, and JSON export

It also includes login/register UI with Applicant and Company Owner/Recruiter roles, password demo flow, and a simulated OTP flow.

## Run locally
Open `index.html` in a browser, or use VS Code's Live Server extension.

## Publish with GitHub Pages
1. Create a GitHub repository, for example `mogus-jobs`.
2. Upload/push **all files and folders** while preserving the folder structure.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for deployment. Your site URL will look like `https://YOUR-USERNAME.github.io/mogus-jobs/`.
   - If the repository is named `YOUR-USERNAME.github.io`, the URL is usually `https://YOUR-USERNAME.github.io/`.
7. Share that URL. All sections are available through the page's navigation links.

## Important limitations of GitHub Pages
GitHub Pages hosts static files only. This starter is a **front-end prototype**, not a production job portal:
- Jobs, demo accounts, saved jobs and demo login state are stored in that visitor's browser using `localStorage`; different visitors do not share data.
- OTP is simulated in the browser and shown on screen. No SMS is sent.
- Passwords are stored in browser localStorage for demo purposes. Do not use real credentials.
- A static frontend cannot securely verify users, send SMS, enforce roles, or store shared job postings.

## For a real portal
Keep this frontend, then add a Java + Spring Boot backend and a database such as MySQL. Move registration/login, password hashing, OTP generation/verification, recruiter authorization, job CRUD, and job search into backend REST APIs. Use an SMS provider to deliver OTP. Never store plain-text passwords or trust role checks that exist only in frontend JavaScript.
