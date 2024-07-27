const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '123456789:xxxxxxxxxxxxxxxxxxxxxx';  // 请替换为您的实际 Telegram Bot Token
const bot = new TelegramBot(token, { polling: true });

const API_BASE_URL = 'https://xyz.xyz.xyz/api';  // 替换为实际的 API URL
