const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const User = require('../models/User');

const router = express.Router();

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const callbackUrl = process.env.TWITTER_CALLBACK_URL || 'http://localhost:4000/auth/twitter/callback';

router.get('/twitter', async (req, res) => {
  if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
    return res.status(500).send('Twitter OAuth is not configured');
  }

  const { url, codeVerifier, state } = await twitterClient.generateOAuth2AuthLink(callbackUrl, {
    scope: ['tweet.read', 'users.read', 'offline.access'],
  });

  req.session.codeVerifier = codeVerifier;
  req.session.twitterState = state;

  res.redirect(url);
});

router.get('/twitter/callback', async (req, res) => {
  try {
    const { state, code } = req.query;

    if (!state || state !== req.session.twitterState) {
      return res.status(400).send('Invalid state');
    }

    const tokenResponse = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier: req.session.codeVerifier,
      redirectUri: callbackUrl,
    });

    const loggedClient = new TwitterApi(tokenResponse.accessToken);
    const profile = await loggedClient.v2.me({ 'user.fields': 'profile_image_url,username,name' });

    const update = {
      twitterId: profile.data.id,
      twitterHandle: profile.data.username,
      displayName: profile.data.name,
      profileImage: profile.data.profile_image_url,
      lastUpdated: new Date(),
    };

    const user = await User.findOneAndUpdate(
      { twitterId: profile.data.id },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.session.userId = user._id;
    req.session.twitterHandle = user.twitterHandle;

    res.redirect(process.env.FRONTEND_URL || '/');
  } catch (error) {
    console.error('Twitter callback error', error);
    res.status(500).send('Twitter callback failed');
  }
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(200).json({ user: null });
  }

  const user = await User.findById(req.session.userId).lean();
  if (!user) {
    req.session = null;
    return res.status(200).json({ user: null });
  }

  res.json({
    user: {
      id: user._id,
      twitterHandle: user.twitterHandle,
      displayName: user.displayName,
      profileImage: user.profileImage,
      quizScore: user.quizScore,
      contributionScore: user.contributionScore,
      totalScore: user.totalScore,
    },
  });
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

module.exports = router;
