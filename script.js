let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = []; // Перемешанные вопросы






const questionsByCategory = {
  islam: [
      {
          question: "Как называется глава в Коране?",
          answers: ["Часть", "Заголовок", "Сура", "Аят"],
          correctAnswer: 2
      },
      {
          question: "Сколько сур в Коране?",
          answers: ["112", "113", "114", "115"],
          correctAnswer: 2
      },
      // Добавьте больше вопросов по Исламу
  ],
  history: [
      {
          question: "В каком году началась Вторая мировая война?",
          answers: ["1939", "1941", "1945", "1935"],
          correctAnswer: 0
      },
      {
          question: "Кто был первым президентом США?",
          answers: ["Джордж Вашингтон", "Авраам Линкольн", "Томас Джефферсон", "Барак Обама"],
          correctAnswer: 0
      },
      // Добавьте больше вопросов по истории
  ],
  science: [
      {
          question: "Какой газ преобладает в атмосфере Земли?",
          answers: ["Кислород", "Азот", "Углекислый газ", "Водород"],
          correctAnswer: 1
      },
      {
          question: "Кто открыл закон всемирного тяготения?",
          answers: ["Исаак Ньютон", "Альберт Эйнштейн", "Галилео Галилей", "Никола Тесла"],
          correctAnswer: 0
      },
      // Добавьте больше вопросов по науке
  ],
  literature: [
      {
          question: "Кто написал 'Войну и мир'?",
          answers: ["Лев Толстой", "Федор Достоевский", "Антон Чехов", "Иван Тургенев"],
          correctAnswer: 0
      },
      {
          question: "Кто автор 'Гарри Поттера'?",
          answers: ["Джоан Роулинг", "Стивен Кинг", "Джордж Мартин", "Дж. Р. Р. Толкин"],
          correctAnswer: 0
      },
      // Добавьте больше вопросов по литературе
  ]
};


// 🔄 Функция перемешивания массива
function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 🔥 Загрузка сохраненного прогресса
function loadProgress() {
    const savedIndex = localStorage.getItem("quizIndex");
    const savedScore = localStorage.getItem("quizScore");
    const savedQuestions = localStorage.getItem("shuffledQuestions");

    shuffledQuestions = savedQuestions ? JSON.parse(savedQuestions) : shuffleArray(questions);
    if (!savedQuestions) localStorage.setItem("shuffledQuestions", JSON.stringify(shuffledQuestions));

    currentQuestionIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
    score = savedScore !== null ? parseInt(savedScore) : 0;

    updateGemDisplay();
}

// 🔥 Сохранение прогресса
function saveProgress() {
    localStorage.setItem("quizIndex", currentQuestionIndex);
    localStorage.setItem("quizScore", score);
}

// 🔥 Обновление GEM в игре и профиле
function updateGemDisplay() {
    document.getElementById("gemCount").innerText = score;
    document.getElementById("profileGemCount").innerText = score;
    document.getElementById("gemBalance").innerText = score;
    localStorage.setItem("quizScore", score);
}

function loadQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length) {
      shuffledQuestions = shuffleArray(shuffledQuestions); // Перемешиваем вопросы, если они закончились
      currentQuestionIndex = 0;
  }

  const questionData = shuffledQuestions[currentQuestionIndex];
  const questionElement = document.getElementById("question");
  const answersContainer = document.getElementById("answers");
  const nextButton = document.getElementById("nextQuestion");

  questionElement.classList.remove("show");
  nextButton.classList.remove("show");
  answersContainer.innerHTML = "";

  setTimeout(() => {
      questionElement.innerText = questionData.question;
      questionElement.classList.add("show");

      questionData.answers.forEach((answer, index) => {
          const button = document.createElement("button");
          button.classList.add("answer-button");
          button.innerText = answer;
          button.onclick = () => checkAnswer(index);

          setTimeout(() => button.classList.add("show"), index * 100);
          answersContainer.appendChild(button);
      });

      setTimeout(() => nextButton.classList.add("show"), 500);
      saveProgress();
  }, 300);
}

// 🔄 Проверка ответа
function checkAnswer(index) {
  const questionData = shuffledQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll(".answer-button");

  if (index === questionData.correctAnswer) {
      score++; // Увеличиваем общий счёт
      updateGemDisplay(); // Обновляем отображение GEM'ов
      buttons[index].classList.add("correct"); // Подсвечиваем правильный ответ
  } else {
      buttons[index].classList.add("incorrect"); // Подсвечиваем неправильный ответ
      buttons[questionData.correctAnswer].classList.add("correct"); // Показываем правильный ответ
  }

  buttons.forEach(button => button.disabled = true); // Блокируем кнопки после ответа
  setTimeout(loadNextQuestion, 1000); // Переходим к следующему вопросу через 1 секунду
}

// 🔄 Следующий вопрос
function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// 🔄 Завершение викторины
function claimGem() {
    alert("Викторина завершена! Вы заработали " + score + " GEM.");
    localStorage.clear();
}

// 🔄 Сброс викторины
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    shuffledQuestions = shuffleArray(questions);
    localStorage.setItem("shuffledQuestions", JSON.stringify(shuffledQuestions));
    localStorage.removeItem("quizIndex");
    localStorage.removeItem("quizScore");

    updateGemDisplay();
    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "flex";
    document.getElementById("claimGem").style.display = "none";

    loadQuestion();
}

// 🔄 Переключение страниц
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    document.getElementById(`${pageId}-page`).style.display = "block";

    document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));
    const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
    if (activeButton) activeButton.classList.add("active");
}

// 🔥 Дополнительные способы получения GEM
function inviteFriend() {
    alert("Скопируйте и отправьте другу ссылку: https://yourgame.github.io/");
    score += 5;
    updateGemDisplay();
}

function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank");
    alert("Спасибо за подписку! Вы получили +3 GEM.");
    score += 3;
    updateGemDisplay();
}

function watchAd() {
    alert("Представьте, что здесь реклама 😆. Вы получили +2 GEM!");
    score += 2;
    updateGemDisplay();
}

// 📖 Переворот книги
function flipBook(book) {
    book.classList.toggle("flipped");
}

// 🛒 Покупка книги
function buyItem(price, itemName, event) {
    event.stopPropagation();
    if (score >= price) {
        score -= price;
        updateGemDisplay();
        alert(`Вы купили книгу: "${itemName}" 📚`);
    } else {
        alert("Недостаточно GEM'ов! 😢");
    }
}

// 🔥 Загрузка прогресса при старте
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    loadQuestion();
    showPage('quiz');
});

// Интеграция Telegram Web App для получения реального ID
function getTelegramId() {
    if (window.Telegram && window.Telegram.WebApp) {
        telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
        document.getElementById("telegramId").innerText = telegramId;
        document.getElementById("profileTelegramId").innerText = telegramId;
    } else {
        telegramId = "Не определен";
    }
}

// Функция для начала викторины
function startQuiz() {
    // Показываем контейнер с викториной
    document.getElementById("quizContent").style.display = "block";
    // Скрываем большие кнопки
    document.querySelector(".main-buttons").style.display = "none";
    // Загружаем первый вопрос
    loadQuestion();
}

// Функция для перезапуска викторины
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById("gemCount").innerText = score;
    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "flex";
    document.getElementById("claimGem").style.display = "none";
    // Показываем большие кнопки
    document.querySelector(".main-buttons").style.display = "flex";
    // Скрываем контейнер с викториной
    document.getElementById("quizContent").style.display = "none";
}

// Инициализация
getTelegramId();
showPage('quiz'); // По умолчанию показываем страницу викторины


function startQuiz(category) {
  shuffledQuestions = shuffleArray(questionsByCategory[category]); // Загружаем вопросы для выбранной категории
  currentQuestionIndex = 0; // Сбрасываем индекс вопроса, но не счёт
  showPage('quiz'); // Переключаемся на страницу викторины
  loadQuestion(); // Загружаем первый вопрос
}

// Функция для начала игры 1vs1 (пока заглушка)
function startOneVsOne() {
  showPage("one-vs-one"); // Показываем страницу игры 1vs1
  const status = document.getElementById("status");
  const socket = new WebSocket("wss://prickly-grey-close.glitch.me"); // Замени на свою ссылку

  socket.onopen = () => {
      status.innerText = "Поиск соперника...";
  };

  socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "wait") {
          status.innerText = data.message;
      } else if (data.type === "start") {
          status.innerText = "Игра началась!";
          startGameLogic(); // Тут начнем вопросы и игру
      }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  showPage('home'); // Показываем главную страницу по умолчанию
  getTelegramId();
});

// Функция для переключения страниц
function showPage(pageId) {
  // Скрываем все страницы
  document.querySelectorAll(".page").forEach(page => page.style.display = "none");

  // Показываем выбранную страницу
  document.getElementById(`${pageId}-page`).style.display = "block";

  // Убираем активный класс у всех кнопок навигации
  document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));

  // Добавляем активный класс к текущей кнопке навигации (если есть)
  const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
  if (activeButton) activeButton.classList.add("active");
}

// Функция для обновления профиля
function updateProfile() {
  const profileName = document.getElementById("profileName");
  const profileGemCount = document.getElementById("profileGemCount");

  // Пример имени пользователя (можно заменить на реальное имя из Telegram)
  profileName.innerText = "Имя пользователя";

  // Обновляем количество GEM
  profileGemCount.innerText = score; // Используем переменную score из вашего кода
}

// Вызываем функцию при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  updateProfile(); // Обновляем профиль
  showPage('home');
  getTelegramId();
});

// Функция для получения ID и имени пользователя из Telegram
function getTelegramId() {
  if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      const profileName = document.getElementById("profileName");

      if (user) {
          // Отображаем имя пользователя
          profileName.innerText = user.first_name || "Пользователь";
      }
  } else {
      // Если Telegram Web App не доступен, используем заглушку
      document.getElementById("profileName").innerText = "Пользователь";
  }
}


// Функция для открытия модального окна профиля
function openProfileModal() {
  const modal = document.getElementById("profileModal");
  modal.style.display = "flex"; // Показываем модальное окно

  // Обновляем данные в модальном окне
  document.getElementById("modalUserName").innerText = document.getElementById("profileName").innerText;
  document.getElementById("modalUserId").innerText = document.getElementById("telegramId").innerText;
  document.getElementById("modalUserGem").innerText = document.getElementById("profileGemCount").innerText;
}

// Функция для закрытия модального окна профиля
function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  modal.style.display = "none"; // Скрываем модальное окно
}

// Закрытие модального окна при клике вне его области
window.onclick = function (event) {
  const modal = document.getElementById("profileModal");
  if (event.target === modal) {
      closeProfileModal();
  }
};






// Функция для получения данных пользователя из Telegram Web App
function getTelegramUserData() {
  if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;

      if (user) {
          // Возвращаем имя и ID пользователя
          return {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
          };
      }
  }
  return null; // Если данные недоступны
}



// Функция для обновления профиля
function updateProfile() {
  const userData = getTelegramUserData(); // Получаем данные пользователя
  const profileName = document.getElementById("profileName");
  const profileGemCount = document.getElementById("profileGemCount");
  const modalUserName = document.getElementById("modalUserName");
  const modalUserId = document.getElementById("modalUserId");

  if (userData) {
      // Если данные пользователя доступны (Telegram Web App)
      const fullName = userData.firstName + (userData.lastName ? ` ${userData.lastName}` : "");
      profileName.innerText = fullName; // Отображаем имя на главной странице
      modalUserName.innerText = fullName; // Отображаем имя в модальном окне
      modalUserId.innerText = userData.id; // Отображаем ID в модальном окне
  } else {
      // Если данные недоступны (например, в браузере)
      profileName.innerText = "Пользователь";
      modalUserName.innerText = "Пользователь";
      modalUserId.innerText = "Не определен";
  }

  // Обновляем количество GEM
  profileGemCount.innerText = score; // Используем переменную score из вашего кода
  document.getElementById("modalUserGem").innerText = score;
}

// Вызываем функцию при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  updateProfile(); // Обновляем профиль
  showPage('home');
});


// Функция для открытия модального окна профиля
function openProfileModal() {
  const modal = document.getElementById("profileModal");
  modal.style.display = "flex"; // Показываем модальное окно

  // Обновляем данные в модальном окне
  const userData = getTelegramUserData();
  if (userData) {
      const fullName = userData.firstName + (userData.lastName ? ` ${userData.lastName}` : "");
      document.getElementById("modalUserName").innerText = fullName;
      document.getElementById("modalUserId").innerText = userData.id;
  } else {
      document.getElementById("modalUserName").innerText = "Пользователь";
      document.getElementById("modalUserId").innerText = "Не определен";
  }

  document.getElementById("modalUserGem").innerText = document.getElementById("profileGemCount").innerText;
}








// Генерация реферальной ссылки
function generateReferralLink() {
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "defaultUser";
  const baseUrl = "https://yourgame.github.io/"; // Замените на ваш URL
  return `${baseUrl}?ref=${userId}`;
}

// Отображение реферальной ссылки
function displayReferralLink() {
  const referralLink = generateReferralLink();
  document.getElementById("referralLink").value = referralLink;
}

// Копирование реферальной ссылки
function copyReferralLink() {
  const referralLink = document.getElementById("referralLink");
  referralLink.select();
  document.execCommand("copy");
  alert("Ссылка скопирована! Поделитесь ею с друзьями.");
}

// Получение количества приглашённых друзей
function getReferralCount() {
  return parseInt(localStorage.getItem("referralCount")) || 0;
}

// Обновление количества приглашённых друзей
function updateReferralCount() {
  const referralCount = getReferralCount();
  document.getElementById("referralCount").innerText = referralCount;
}

// Начисление GEM за приглашённого друга
function addReferral() {
  let referralCount = getReferralCount();
  referralCount += 1;
  localStorage.setItem("referralCount", referralCount);

  // Начисляем GEM за приглашённого друга
  score += 5; // Например, 5 GEM за каждого друга
  updateGemDisplay();
  updateReferralCount();
}

// Проверка реферальной ссылки при загрузке страницы
function checkReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const refUserId = urlParams.get("ref");

  if (refUserId && refUserId !== (window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "defaultUser")) {
      // Если пользователь перешёл по реферальной ссылке
      addReferral();
  }
}

// Инициализация реферальной системы
document.addEventListener("DOMContentLoaded", () => {
  displayReferralLink();
  updateReferralCount();
  checkReferral();
});




function generateReferralLink() {
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "defaultUser";
  const baseUrl = "https://web3quiz.github.io/viktorini/"; // Замените на ваш URL
  return `${baseUrl}?ref=${userId}`;
}

// Удаляем или комментируем этот код
// document.getElementById("telegramId").innerText = telegramId;
// document.getElementById("profileTelegramId").innerText = telegramId;

// Обновление GEM в игре и профиле
function updateGemDisplay() {
  // Обновляем GEM'ы на всех элементах страницы
  document.getElementById("profileGemCount").innerText = score; // На главной странице
  document.getElementById("gemBalance").innerText = score; // В магазине
  document.getElementById("modalUserGem").innerText = score; // В модальном окне профиля

  // Сохраняем счёт в localStorage
  localStorage.setItem("quizScore", score);
}


// Удаляем эту функцию
function claimGem() {
  alert("Викторина завершена! Вы заработали " + score + " GEM.");
  localStorage.clear();
}



// Функция для получения данных пользователя из Telegram Web App
function getTelegramUserData() {
  if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;

      if (user) {
          // Возвращаем имя и ID пользователя
          return {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
          };
      }
  }
  return null; // Если данные недоступны
}

// Пример использования
document.addEventListener("DOMContentLoaded", () => {
  const userData = getTelegramUserData();
  if (userData) {
      console.log("ID пользователя:", userData.id);
      console.log("Имя пользователя:", userData.firstName);
  } else {
      console.log("Данные пользователя недоступны.");
  }
});















// Функция для отправки результатов в Telegram бот
async function sendResultsToBot(score) {
  const userData = getTelegramUserData();
  if (!userData) {
      console.log("Данные пользователя недоступны.");
      return;
  }

  const botToken = "7512030725:AAHijyQ1c8RaJ7EwSbYMxFNkFmraQcYNC3s"; // Замените на токен вашего бота
  const chatId = "YOUR_CHAT_ID"; // Замените на ID чата (например, ваш личный ID)

  const message = `Пользователь ${userData.firstName} (ID: ${userData.id}) набрал ${score} GEM в викторине!`;

  try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              chat_id: chatId,
              text: message,
          }),
      });

      if (response.ok) {
          console.log("Результаты отправлены в Telegram бот.");
      } else {
          console.error("Ошибка при отправке результатов:", await response.text());
      }
  } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
  }
}

// Пример использования
document.addEventListener("DOMContentLoaded", () => {
  const score = 100; // Пример результата
  sendResultsToBot(score);
});

const initData = window.Telegram.WebApp.initData;

fetch("/auth/telegram", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData }),
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Ошибка авторизации:", error));




    const crypto = require("crypto");

function verifyTelegramData(initData, botToken) {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    params.delete("hash");

    const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const computedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    return computedHash === hash;
}

// Пример использования
app.post("/auth/telegram", (req, res) => {
    const { initData } = req.body;
    const botToken = "YOUR_BOT_TOKEN"; // Замените на токен вашего бота

    if (verifyTelegramData(initData, botToken)) {
        res.json({ success: true, message: "Авторизация успешна!" });
    } else {
        res.status(401).json({ success: false, message: "Ошибка авторизации." });
    }
});


function saveUserResults(userId, score) {
  const results = JSON.parse(localStorage.getItem("quizResults")) || {};
  results[userId] = score;
  localStorage.setItem("quizResults", JSON.stringify(results));
}

// Пример использования
document.addEventListener("DOMContentLoaded", () => {
  const userData = getTelegramUserData();
  if (userData) {
      saveUserResults(userData.id, score);
  }
});


// Функция для сохранения результатов на сервере
async function saveResults(score) {
  const initData = window.Telegram.WebApp.initData;

  try {
      const response = await fetch("https://your-project.glitch.me/save-results", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ initData, score }),
      });

      if (response.ok) {
          console.log("Результаты сохранены на сервере.");
      } else {
          console.error("Ошибка при сохранении результатов:", await response.text());
      }
  } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
  }
}

// Функция для получения результатов с сервера
async function getResults(userId) {
  try {
      const response = await fetch(`https://your-project.glitch.me/get-results?userId=${userId}`);
      const data = await response.json();
      return data.score;
  } catch (error) {
      console.error("Ошибка при получении результатов:", error);
      return 0;
  }
}

// Пример использования
document.addEventListener("DOMContentLoaded", async () => {
  const userData = getTelegramUserData();
  if (userData) {
      // Сохраняем результаты
      await saveResults(score);

      // Получаем результаты
      const savedScore = await getResults(userData.id);
      console.log("Сохранённые результаты:", savedScore);
  }
});



// Функция для сохранения результатов на сервере
async function saveResults(score) {
  const initData = window.Telegram.WebApp.initData;

  try {
      const response = await fetch("https://your-project.glitch.me/save-results", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ initData, score }),
      });

      if (response.ok) {
          console.log("Результаты сохранены на сервере.");
      } else {
          console.error("Ошибка при сохранении результатов:", await response.text());
      }
  } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
  }
}

// Функция для получения результатов с сервера
async function getResults(userId) {
  try {
      const response = await fetch(`https://your-project.glitch.me/get-results?userId=${userId}`);
      const data = await response.json();
      return data.score;
  } catch (error) {
      console.error("Ошибка при получении результатов:", error);
      return 0;
  }
}

// Пример использования
document.addEventListener("DOMContentLoaded", async () => {
  const userData = getTelegramUserData();
  if (userData) {
      // Сохраняем результаты
      await saveResults(score);

      // Получаем результаты
      const savedScore = await getResults(userData.id);
      console.log("Сохранённые результаты:", savedScore);
  }
});







// Генерация реферальной ссылки
function generateReferralLink() {
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "defaultUser";
  const baseUrl = "https://yourgame.github.io/"; // Замените на ваш URL
  return `${baseUrl}?ref=${userId}`;
}

// Отображение реферальной ссылки
function displayReferralLink() {
  const referralLink = generateReferralLink();
  document.getElementById("referralLink").value = referralLink;
}

// Копирование реферальной ссылки
function copyReferralLink() {
  const referralLink = document.getElementById("referralLink");
  referralLink.select();
  document.execCommand("copy");
  alert("Ссылка скопирована! Поделитесь ею с друзьями.");
}

// Получение количества приглашённых друзей
function getReferralCount() {
  return parseInt(localStorage.getItem("referralCount")) || 0;
}

// Обновление количества приглашённых друзей
function updateReferralCount() {
  const referralCount = getReferralCount();
  document.getElementById("referralCount").innerText = referralCount;
}

// Начисление GEM за приглашённого друга
function addReferral() {
  let referralCount = getReferralCount();
  referralCount += 1;
  localStorage.setItem("referralCount", referralCount);

  // Начисляем GEM за приглашённого друга
  score += 5; // Например, 5 GEM за каждого друга
  updateGemDisplay();
  updateReferralCount();
}

// Проверка реферальной ссылки при загрузке страницы
function checkReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const refUserId = urlParams.get("ref");

  if (refUserId && refUserId !== (window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "defaultUser")) {
      // Если пользователь перешёл по реферальной ссылке
      addReferral();
  }
}

// Инициализация реферальной системы
document.addEventListener("DOMContentLoaded", () => {
  displayReferralLink();
  updateReferralCount();
  checkReferral();
});