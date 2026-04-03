# Fairbrix Quiz Backend

This repository now runs an Express service that powers the Fairbrix Ultimate Quest front end. It keeps the leaderboard, survey submissions, Twitter contribution tracking, and OAuth session in MongoDB so the JavaScript game can focus on UX.

## Setup

1. Install the dependencies (if you need to re-run):
   `ash
   npm install
   `
2. Provide the following environment variables (via .env or your hosting platform):
   - PORT (optional, defaults to 4000)
   - FRONTEND_URL (optional, so the OAuth flow can redirect back)
   - MONGO_URI (defaults to mongodb://127.0.0.1:27017/fairbrix)
   - SESSION_SECRET (any long random string for the cookie session)
   - TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_CALLBACK_URL (for X OAuth 2.0)
   - TWITTER_BEARER_TOKEN (for searching Fairbrix mentions; read-only tokens are fine)
3. Replace the placeholder in public/index.html with your complete quiz UI so Express can serve it as-is.
4. Start the backend:
   `ash
   npm start
   `
   Use 
pm run dev if you prefer NODE_ENV=development logging / auto-reload workflows.

## API Overview

These REST endpoints rely on HTTP-only cookie sessions with credentials: 'include'.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /auth/twitter | Starts the X (Twitter) OAuth 2.0 flow and redirects to X for consent.
| GET | /auth/twitter/callback | Handles the OAuth callback, creates/updates the user, and stores the session.
| GET | /auth/me | Returns the signed-in profile: { user: { id, twitterHandle, displayName, profileImage, quizScore, contributionScore, totalScore } }.
| POST | /auth/logout | Clears the session.
| POST | /api/submit-quiz | Saves a quiz run (body requires { name, quizScore, total, futureVision, blockchain, testimonial, twitterLink }).
| GET | /api/leaderboard | Returns the top 50 players ordered by 	otalScore. Response: { leaderboard: [...] }.
| GET | /api/user/:id | Fetches a single user’s stored state, useful for profile/score pages.
| POST | /api/track-twitter | Searches Fairbrix mentions from the configured handle. Body needs { twitterHandle } or { userId }. Returns the contributions metrics plus the updated 	otalScore.

## Contribution tracker notes

The /api/track-twitter endpoint proxies the X search API, which requires a paid developer tier (e.g., Elevated or above). If your bearer token lacks that access, the backend now responds with HTTP 402 and a message like Tweet search access requires an upgraded X developer plan.. Handle this on the UI by showing a friendly warning (and optionally disabling the  scan my activity button) until you have a plan that supports tweet search.

## Front-End Integration

1. Hook your login button to GET /auth/twitter so players can sign in via X. Once they return, call /auth/me (with credentials: 'include') to know who is logged in and toggle the quiz UI.
2. After each quiz run, POST to /api/submit-quiz with this payload:
   `js
   await fetch('/api/submit-quiz', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: player.name,
       quizScore: score,
       total: questions.length,
       futureVision,
       blockchain,
       testimonial,
       twitterLink: twitterLink || '',
     }),
   });
   `
3. Render the leaderboard by calling /api/leaderboard. Replace the window.storage logic with the entries returned by that endpoint so the rankings reflect real data.
4. Let players trigger /api/track-twitter before leaderboard refresh. When the backend responds with status: 402, show a clear notice (e.g., Upgrade your X API plan to scan Fairbrix mentions) and disable the scan button until the issue is resolved. All other errors should surface via the returned message so the user isn’t guessing what went wrong.

## Rewards Hook

services/rewardService.js currently logs the action (console.log). Replace that stub with your actual FBX faucet or payout mechanism and call it from /api/submit-quiz or after /api/track-twitter once you have a scoring threshold.

## Testing

There are no automated tests yet. Running 
pm start (or 
pm run dev) and pointing your browser at http://localhost:4000 lets you interact with both the static front end and the API routes described above.
