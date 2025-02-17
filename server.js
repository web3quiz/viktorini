const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Используем JSON-формат для передачи данных
app.use(bodyParser.json());

// Ваш секретный токен (который Telegram использует для проверки подписи)
const TELEGRAM_BOT_TOKEN = 'your_bot_token_here';

// Обработчик для получения данных с Telegram
app.post('/auth', (req, res) => {
  const telegramData = req.body;

  // Валидация подписи данных (дополнительно можно проверить, что данные подлинные)
  // Например, можно использовать secret, чтобы проверить подпись данных через Telegram API

  if (telegramData) {
    // Получаем Telegram ID и отправляем данные обратно на клиент
    const userId = telegramData.id;
    res.json({
      success: true,
      userId: userId
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
});

// Стартуем сервер
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
