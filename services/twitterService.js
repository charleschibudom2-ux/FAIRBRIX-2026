const { TwitterApi } = require('twitter-api-v2');
const bearerToken = process.env.TWITTER_BEARER_TOKEN;

function getTwitterClient() {
  if (!bearerToken) {
    throw new Error('TWITTER_BEARER_TOKEN is not configured');
  }
  return new TwitterApi(bearerToken);
}

async function fetchContributionMetrics(twitterHandle, maxResults = 100) {
  try {
    const client = getTwitterClient();
    const sanitizedHandle = twitterHandle ? twitterHandle.replace(/[^a-zA-Z0-9_]/g, '') : '';
    const queryHandle = sanitizedHandle || twitterHandle || '';
    if (!queryHandle) {
      return {
        tweetCount: 0,
        likes: 0,
        reposts: 0,
        replies: 0,
        score: 0,
      };
    }
    const query = 'from:' + queryHandle + ' (Fairbrix OR #Fairbrix)';

    const response = await client.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': 'public_metrics',
    });

    const tweets = response?.tweets ?? [];
    let likes = 0;
    let reposts = 0;
    let replies = 0;

    tweets.forEach((tweet) => {
      const metrics = tweet.public_metrics || {};
      likes += metrics.like_count || 0;
      reposts += metrics.retweet_count || 0;
      replies += metrics.reply_count || 0;
    });

    const tweetCount = tweets.length;
    const score = tweetCount * 5 + likes + reposts * 3 + replies * 2;

    return {
      tweetCount,
      likes,
      reposts,
      replies,
      score,
    };
  } catch (error) {
    const statusCode = error.code || error?.response?.status || error?.status;
    const errMessage =
      statusCode === 402
        ? 'Twitter search requires an upgraded API plan (HTTP 402).'
        : error.message || 'Unable to fetch Twitter mentions.';
    const err = new Error(errMessage);
    err.statusCode = statusCode || 500;
    throw err;
  }
}

module.exports = {
  fetchContributionMetrics,
};
