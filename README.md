# Mogus Jobs — login-gated three-page frontend

## Pages
- `index.html` — Login / Get Started. Users register with name, phone number, password, and account type.
- `jobs.html` — Applicant job search and filters.
- `recruiter.html` — Recruiter job form, posting history, edit/delete, JSON backup and restore.

## Login gate
The job search and recruiter pages redirect to the home page unless a user is logged in. Applicants go to job search after login; recruiters go to the recruiter workspace. The recruiter page checks that the current demo account has the recruiter role. Protected pages include a Log out button.

## Upload to GitHub Pages
1. Extract the ZIP.
2. Upload all contents to the root of your existing GitHub repository. Ensure `index.html`, `jobs.html`, and `recruiter.html` are at the repository root, with `css/` and `js/` folders.
3. Commit the changes.
4. In Settings → Pages, select Deploy from a branch, `main`, and `/(root)`.
5. After deployment, use the HTTPS GitHub Pages URL for the repository.

## Where data is stored
Job listings are in browser `localStorage`; demo accounts are also in browser `localStorage`; the signed-in session is kept in `sessionStorage`. Jobs/accounts are not shared across devices or users. Use the recruiter page's Export JSON backup to save job data.

## Security limitation — important
This is a frontend demo login gate, not production security. Passwords are stored in plain text in browser storage and can be inspected or bypassed; there is no actual SMS OTP verification. Do not use real passwords or sensitive data. To truly protect all features, implement authentication and authorization in the Java Spring Boot backend, store password hashes (e.g. BCrypt), verify phone OTP on the server using an SMS provider, and require a valid server session/token on every protected API request. GitHub Pages alone cannot securely enforce access to static HTML pages.
