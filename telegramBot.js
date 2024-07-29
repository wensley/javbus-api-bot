const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '123456789:xxxxxxxxxxxxxxxxxxxxxx';  // 请替换为您的Telegram Bot Token
const bot = new TelegramBot(token, { polling: true });
const API_BASE_URL = 'https://xyz.xyz.xyz/api';  // 替换为您的API URL


// 发送请求的函数
async function sendRequest(url, options = {}) {
  try {
    const response = await axios({
      ...options,
      url,
    });
    return response.data;
  } catch (error) {
    console.error(`[ERROR] Error sending request to ${url}:`, error);
    console.error('Status:', error.response ? error.response.status : 'Unknown');
    console.error('Data:', error.response ? error.response.data : 'No response');
    console.error('Message:', error.message);
    throw error;
  }
}

// 处理 /start 指令
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`[INFO] User ${msg.from.username} started the bot.`);
  bot.sendMessage(chatId, 'Welcome to the @avgifbusbot ! Use /help to see available commands.');
});

// 处理 /help 指令
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`[INFO] User ${msg.from.username} requested help.`);
  const helpMessage = `
Available commands:
/search [keyword] - Search movies by keyword
/id [id] - Get movie details and magnet links by ID
/star [id] - Get star details by ID
/starsearch [keyword] - Search stars by keyword
/starpage [id] [page] - Get star movies by page
/latest - Get the latest movies
`;
  bot.sendMessage(chatId, helpMessage);
});

// 搜索电影
bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  console.log(`[INFO] User ${msg.from.username} searched for "${query}".`);
  try {
    const data = await sendRequest(`${API_BASE_URL}/movies/search`, {
      params: { keyword: query }
    });
    const movies = data.movies;
    let message = 'Search results:\n';
    movies.forEach(movie => {
      message += `\nTitle: ${movie.title}\nID: ${movie.id}\nDate: ${movie.date}\n`;
    });
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(`[ERROR] Error fetching search results: ${error.message}`);
    bot.sendMessage(chatId, 'Error fetching data from API');
  }
});

// 获取电影详情和磁力链接
bot.onText(/\/id (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const movieId = match[1];
  console.log(`[INFO] User ${msg.from.username} requested details for movie ID: ${movieId}`);
  
  try {
    console.log(`[INFO] Fetching movie with ID: ${movieId}`);
    const movie = await sendRequest(`${API_BASE_URL}/movies/${movieId}`);
    const title = movie.title || 'N/A';
    const date = movie.date || 'N/A';
    const tags = movie.tags ? movie.tags.join(', ') : 'N/A';
    const genres = movie.genres ? movie.genres.map(genre => genre.name).join(', ') : 'N/A';
    const stars = movie.stars ? movie.stars.map(star => star.name).join(', ') : 'N/A';
    const image = movie.img || null;
    
    let message = `
【Title】 <code>${title}</code>
【Code】 <code>${movieId}</code>
【Date】 <code>${date}</code>
`;
    if (movie.stars && movie.stars.length > 0) {
      message += '【Actor】 ';
      movie.stars.forEach((star, index) => {
        message += `<code>${star.name}</code>${index < movie.stars.length - 1 ? ' | ' : ''}`;
      });
      message += '\n';
    }
    message += `【Tags】 <code>${tags}</code>\n`;

    // 获取磁力链接
    let magnets = [];
    try {
      magnets = await sendRequest(`${API_BASE_URL}/magnets/${movieId}`, {
        params: { gid: movie.gid, uc: movie.uc }
      });

      if (magnets && magnets.length > 0) {
        // 使用第一个磁力链接的大小
        const fileSize = magnets[0].size;
        
        // 格式化文件大小
        const formatSize = (sizeString) => {
          const size = parseFloat(sizeString);
          const unit = sizeString.replace(/[0-9.]/g, '').trim().toUpperCase();
          
          if (unit === 'GB') {
            return `${size.toFixed(2)} GB`;
          } else if (unit === 'MB') {
            return `${(size / 1024).toFixed(2)} GB`;
          } else {
            return `${size} ${unit}`;
          }
        };

        const formattedSize = formatSize(fileSize);
        message += `【Magnet】 ${movie.videoLength || 'N/A'}分钟 ${formattedSize}\n`;
        magnets.slice(0, 3).forEach((magnet, index) => {
          message += `【magnet Links ${index + 1}】 <code>${magnet.link}</code>\n`;
        });
      } else {
        message += '【Magnet】 No magnet links available.\n';
      }
    } catch (error) {
      console.error(`[ERROR] Error fetching magnet links: ${error.message}`);
      message += '【Magnet】 Error fetching magnet links.\n';
    }


    // 发送电影详情消息
    const options = {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "截图", callback_data: `sample_${movieId}_0` },
            ...(magnets && magnets.length > 0 ? [
              {
                text: "在线播放",
                url: `https://keepshare.org/gc6ia801/${encodeURIComponent(magnets[0].link)}`
              }
            ] : [])
          ],
          [
            { text: "项目地址", url: "https://github.com/wensley/javbus-api" },
            { text: "关注频道", url: "https://t.me/zhcnxyz" }
          ]
        ]
      }
    };

    try {
      if (image) {
        await bot.sendPhoto(chatId, image, { caption: message, ...options });
      } else {
        throw new Error('No image available');
      }
    } catch (error) {
      console.error(`[ERROR] Error sending photo: ${error.message}`);
      // 如果发送图片失败，就只发送文字消息
      await bot.sendMessage(chatId, message, options);
    }

  } catch (error) {
    console.error(`[ERROR] Error fetching movie data: ${error.message}`);
    await bot.sendMessage(chatId, 'Error fetching data from API.');
  }
});

// 搜索演员
bot.onText(/\/starsearch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  console.log(`[INFO] User ${msg.from.username} searched for star: "${query}".`);
  try {
    const data = await sendRequest(`${API_BASE_URL}/stars/search`, {
      params: { keyword: query }
    });
    const stars = data.stars;
    let message = 'Search results:\n';
    stars.forEach(star => {
      message += `\nName: ${star.name}\nID: ${star.id}\n`;
    });
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(`[ERROR] Error fetching star search results: ${error.message}`);
    bot.sendMessage(chatId, 'Error fetching data from API');
  }
});

// 获取演员电影按页
bot.onText(/\/starpage (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const [starId, page] = match[1].split(' ');
  console.log(`[INFO] User ${msg.from.username} requested movies for star ID: ${starId} on page ${page}`);
  try {
    const data = await sendRequest(`${API_BASE_URL}/stars/${starId}/movies`, {
      params: { page }
    });
    const movies = data.movies;
    let message = 'Star movies:\n';
    movies.forEach(movie => {
      message += `\nTitle: ${movie.title}\nID: ${movie.id}\n`;
    });
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(`[ERROR] Error fetching star movies: ${error.message}`);
    bot.sendMessage(chatId, 'Error fetching star movies from API');
  }
});

// 获取最新电影
bot.onText(/\/latest/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`[INFO] User ${msg.from.username} requested latest movies.`);
  try {
    const data = await sendRequest(`${API_BASE_URL}/movies`);
    const movies = data.movies;
    let message = 'Latest movies:\n';
    movies.forEach(movie => {
      message += `\nTitle: ${movie.title}\nID: ${movie.id}\nDate: ${movie.date}\n`;
    });
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(`[ERROR] Error fetching latest movies: ${error.message}`);
    bot.sendMessage(chatId, 'Error fetching latest movies from API');
  }
});

// 处理其他未识别的指令
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`[INFO] User ${msg.from.username} sent an unrecognized message: ${msg.text}`);
  if (!msg.text.startsWith('/')) {
    bot.sendMessage(chatId, 'Unrecognized command. Use /help to see available commands.');
  }
});

// 处理样品图像按钮点击事件
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  if (data.startsWith('sample_')) {
    const [_, movieId, pageStr] = data.split('_');
    const page = parseInt(pageStr);
    console.log(`[INFO] User ${query.from.username} requested sample images for movie ID: ${movieId}, page: ${page}`);
    try {
      const movie = await sendRequest(`${API_BASE_URL}/movies/${movieId}`);
      if (movie.samples && movie.samples.length > 0) {
        const startIndex = page * 5;
        const endIndex = Math.min(startIndex + 5, movie.samples.length);
        const samples = movie.samples.slice(startIndex, endIndex);
        
        // 创建媒体组
        const mediaGroup = samples.map(sample => ({
          type: 'photo',
          media: sample.src
        }));
        
        // 发送媒体组
        await bot.sendMediaGroup(chatId, mediaGroup);
        
        // 如果还有更多图片，添加"下一页"按钮
        if (endIndex < movie.samples.length) {
          await bot.sendMessage(chatId, '查看更多截图', {
            reply_markup: {
              inline_keyboard: [[
                { text: '下一页', callback_data: `sample_${movieId}_${page + 1}` }
              ]]
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, '没有可用的截图。');
      }
    } catch (error) {
      console.error(`[ERROR] Error fetching sample images: ${error.message}`);
      await bot.sendMessage(chatId, '获取截图时出错。');
    }
    // 回应回调查询以消除加载状态
    await bot.answerCallbackQuery(query.id);
  }
});

module.exports = bot;
