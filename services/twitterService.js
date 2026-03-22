const { TwitterApi } = require('twitter-api-v2');
const bearerToken = process.env.TWITTER_BEARER_TOKEN;
function getTwitterClient() {
  if (!bearerToken) {
    throw new Error('TWITTER_BEARER_TOKEN is not configured');
  }
  return new TwitterApi(bearerToken);
}
async function fetchContributionMetrics(twitterHandle, maxResults = 100) {
  const client = getTwitterClient();
  const query = `from:${twitterHandle} (Fairbrix OR #Fairbrix)`;
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
}
module.exports = {
  fetchContributionMetrics,
};