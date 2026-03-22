# Fairbrix Quiz Backend

This repository now runs an Express service that powers the Fairbrix Ultimate Quest front end. It keeps the leaderboard, survey submissions, Twitter contribution tracking, and OAuth session in MongoDB so the JavaScript game can focus on UX.

## Setup

1. Install dependencies once (done already). If you need to re-run:
   `ash
   npm install
   `
2. Provide the following environment variables (.env or hosting platform):
   - PORT (optional, defaults to 4000)
   - FRONTEND_URL (optional, so the OAuth flow can redirect back)
   - MONGO_URI (defaults to mongodb://127.0.0.1:27017/fairbrix)
   - SESSION_SECRET (any long random string)
   - TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_CALLBACK_URL (for X OAuth 2.0)
   - TWITTER_BEARER_TOKEN (for searching Fairbrix mentions, read-only tokens are fine)
3. Drop your existing quiz HTML into public/index.html or update the placeholder there so the Express app can serve it as static content.
4. Run the backend:
   `ash
   npm start
   `

## API Overview

These endpoints use HTTP-only cookie sessions with credentials: 'include'.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /auth/twitter | Starts the X (Twitter) OAuth 2.0 authorization flow. Redirects to X.
| GET | /auth/twitter/callback | Handles the OAuth callback, creates/updates the user, and stores the session.
| GET | /auth/me | Returns the logged-in profile ({ user: { id, twitterHandle, displayName, profileImage, quizScore, contributionScore, totalScore } }).
| POST | /auth/logout | Clears the session.
| POST | /api/submit-quiz | Saves a quiz run. Body must include { name, quizScore, total, futureVision, blockchain, testimonial, twitterLink }. Assumes the session already knows the Twitter user and updates their total score.
| GET | /api/leaderboard | Returns the top 50 players ordered by 	otalScore. Response shape: { leaderboard: [ ... ] }.
| GET | /api/user/:id | Fetches a single user's saved state, useful for detail pages.
| POST | /api/track-twitter | Triggers a Twitter API search for Fairbrix OR #Fairbrix from the given handle. Body should include { twitterHandle } or { userId }. Returns the metrics plus updated total score.

## Front-End Integration

To hook the existing quiz UI to this backend:

1. Call /auth/twitter from your login button to start the OAuth dance and redirect back.
2. After each quiz, POST the answers to /api/submit-quiz with credentials: 'include' so the server can link the attempt to the current session.
3. When showing the Hall of Fame, fetch /api/leaderboard and render the entries instead of relying on window.storage.
4. Provide a button that POSTs to /api/track-twitter to refresh contribution scores before reading them from the leaderboard response.

Example etch for submitting a quiz:
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

Use etch('/auth/me', { credentials: 'include' }) to show the signed-in handle and decide whether to enable quiz controls.

## Rewards Hook

services/rewardService.js is currently a placeholder logging the amount that would be sent through an FBX faucet. Replace the Issuing reward... console.log block with whichever payout system you prefer (mint API call, smart contract, etc.) and call that helper from /submit-quiz or after /track-twitter once the score threshold is reached.

## Testing

Right now there are no automated tests. Running 
pm start and pointing the browser at the server will serve the static public folder and the API described above.
