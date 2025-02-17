const express = require('express');
const path = require('path');  // Для работы с путями к файлам
const bodyParser = require('body-parser');
const app = express();

// Используем JSON-формат для передачи данных
app.use(bodyParser.json());

// Настройка для обслуживания статических файлов (например, HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Ваш токен бота Telegram
const TELEGRAM_BOT_TOKEN = 'your_bot_token_here';

// Обработчик для получения данных с Telegram
app.post('/auth', (req, res) => {
  const telegramData = req.body;

  if (telegramData) {
    const userId = telegramData.id; // Получаем ID пользователя
    res.json({
      success: true,
      userId: userId
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
});

// Добавьте маршрут для главной страницы, чтобы отдавать ваш HTML файл
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Замените на путь к вашему файлу
});

// Стартуем сервер на порту 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
