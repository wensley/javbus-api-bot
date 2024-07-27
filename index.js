const express = require('express');
const app = express();
const port = 3033;

// 引入 Telegram Bot
require('./telegramBot');

app.get('/', (req, res) => {
  res.send('Welcome to Telegram Bot! Use /help to see available commands!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
