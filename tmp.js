const fs = require('fs');

const data = {
  name: 'fairbrix-quest',
  version: '1.0.0',
  description: 'Backend for Fairbrix quiz with leaderboard and Twitter contributions',
  main: 'src/server.js',
  scripts: {
    start: 'node src/server.js',
    dev: 'NODE_ENV=development node src/server.js',
    test:  node -e console.log("no tests yet") 
  },
  keywords: ['fairbrix', 'quiz', 'leaderboard'],
  author: '',
  license: 'ISC',
  type: 'commonjs',
  dependencies: {
    'cookie-session': '^2.0.0',
    cors: '^2.8.6',
    dotenv: '^10.0.0',
    express: '^5.2.1',
    mongoose: '^7.5.0',
    'twitter-api-v2': '^2.10.0'
  }
};

fs.writeFileSync('package.json', JSON.stringify(data, null, 2));
