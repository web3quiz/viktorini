let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = []; // Перемешанные вопросы






const questionsByCategory = {
  quran: [
    
        {
            "question": "Сколько женщин упомянуто в Коране по имени?",
            "answers": ["Три", "Две", "Ни одна", "Одна"],
            "correctAnswer": 3
        },
        {
            "question": "Какой первый запрет в Коране?",
            "answers": ["Не совершайте большие грехи", "Не придавайте Аллаху никого в сотоварищи", "Остерегайтесь грехов", "Не знаю"],
            "correctAnswer": 1
        },
        {
            "question": "Как называется «прочтение Корана от начала до конца»?",
            "answers": ["Фикх", "Джуз", "Хизб", "Хатм", "Не знаю"],
            "correctAnswer": 3
        },
        {
            "question": "Какая мечеть упомянута в коране?",
            "answers": ["Масджид Ан - Нур", "Масджид аль-Харам", "Абрадж аль Бейт", "Масджид Аль Колб", "Не знаю"],
            "correctAnswer": 1
        },
        {
            "question": "По какой причине сподвижники решили собрать Коран в письменном виде?",
            "answers": ["Люди хотели читать Коран на Мусхафе", "Много хафизов Корана погибло на Джихаде", "Распространение Корана везде в письменном виде", "Узнать ответ"],
            "correctAnswer": 1
        },
        {
            "question": "Что такое Мусхаф?",
            "answers": ["Сборник Хадисов", "Толкование Священного Корана", "Коран в виде книги или свитков", "Узнать ответ"],
            "correctAnswer": 2
        },
        {
            "question": "Можно ли читать Коран без омовения, по памяти?",
            "answers": ["Да, нет в этом проблем", "Нет, обязательно наличие омовения", "Смотря какую суру читать", "Не знаю"],
            "correctAnswer": 0
        },
        {
            "question": "О чем говорится в самом длинном аяте в Коране?",
            "answers": ["О лицемерии", "О договорах", "О разводе", "О Судном дне", "Не знаю"],
            "correctAnswer": 1
        },
        {
            "question": "В Коране упоминается о том, что жёны двух пророков окажутся в аду. О ком именно идёт речь?",
            "answers": ["о жёнах Дауда и Нуха", "о жёнах Идриса и Аюба", "о жёнах Нуха и пророка Лута", "о жёнах Салиха и Шуайба"],
            "correctAnswer": 2
        },
        {
            "question": "С чем Пророк Мухаммад ﷺ сравнил верующего, читающего Коран?",
            "answers": ["С фиником (со сладким вкусом и без запаха)", "Со сладким лимоном (обладающим приятным запахом и вкусом)", "С грейпфрутом (обладающим приятным видом и горьким на вкус)", "Со всеми перечисленными фруктами", "Не знаю ответа"],
            "correctAnswer": 0
        },
        {
            "question": "С чем Пророк Мухаммад ﷺ сравнил лицемера, который читает Коран?",
            "answers": ["С картошкой (без запаха и съедобна только после приготовления)", "Со свежим луком (с неприятным запахом и горьким вкусов)", "С базиликом (обладающим приятным запахом, но горьким на вкус)", "Я не знаю ответа"],
            "correctAnswer": 0
        },
        {
            "question": "С чем Пророк Мухаммад ﷺ сравнил лицемера, который НЕ читает Коран?",
            "answers": ["С мускусом", "С картошкой", "С колоквинтом (горький на вкус и не имеет запаха)", "Со всем перечисленным", "Не знаю ответа"],
            "correctAnswer": 2
        },
        {
            "question": "С чем Пророк Мухаммад ﷺ сравнил верующего НЕ читающего Коран?",
            "answers": ["С фиником (обладающим приятным вкусом, но без запаха)", "С лекорством (невкусное, горькое, но полезное)", "С тархуном (приятный запах, но горький на вкус)", "Не знаю ответа"],
            "correctAnswer": 1
        },
        {
            "question": "Кто из родственников Пророка ﷺ упоминается в Коране?",
            "answers": ["1.Его дядя – Абу Лахаб", "2.Его мать – Амина бинт Вахб", "3.Его отец – Абдулла ибн Абд аль-Мутталиб", "Хочу узнать"],
            "correctAnswer": 0
        },
        {
            "question": "В какой суре Священного Корана пришло повеление соблюдать пост в месяц Рамадан?",
            "answers": ["аль Бакара", "Ясин", "ат Тин", "ан Наср", "Не знаю"],
            "correctAnswer": 0
        },
        {
            "question": "В Коране есть упоминание о пророке, называемого по имени его матери. Кто он?",
            "answers": ["Айюб (мир ему)", "Иса (мир ему)", "Салих (мир ему)", "Юсуф (мир ему)"],
            "correctAnswer": 1
        },
        {
            "question": "Кого Аллаһ назвал в Коране братьями дьяволов?",
            "answers": ["расточители", "завистники", "скупые", "не знаю"],
            "correctAnswer": 0
        },
        {
            "question": "Сколько аятов содержит самая большая сура Корана?",
            "answers": ["286", "285", "283", "233"],
            "correctAnswer": 0
        },
        {
            "question": "Как в Коране именуется община пророка Мусы?",
            "answers": ["Сыны Адама", "Сыны Йакуба", "Сыны Исраила", "Сыны Ибрахима"],
            "correctAnswer": 2
        },
        {
            "question": "Кого из сподвижников Аллах назвал в Коране по имени?",
            "answers": ["Зайд ибн Харис", "Халид ибн Валид", "Хасан ибн Сабит", "Анас ибн Малик"],
            "correctAnswer": 0
        },
        {
            "question": "Как в основном ниспосылался Коран?",
            "answers": ["Всевышний Аллах напрямую передавал пророку ﷺ откровения", "Откровения передавались через ангела Джибрииля (мир ему)", "У посланника Аллаха ﷺ были видения", "Посмотреть результаты"],
            "correctAnswer": 1
        },
        {
            "question": "Сколько сур в Коране названо именами пророков (мир им)?",
            "answers": ["6", "25", "5", "Хочу узнать"],
            "correctAnswer": 2
        },
        {
            "question": "Об истории какого пророка в Коране упомянуто больше всего аятов?",
            "answers": ["Мухаммад (мир ему и благословение Аллаха)", "Иса (мир ему)", "Муса (мир ему)", "Хочу узнать"],
            "correctAnswer": 2
        },
        {
            "question": "В какой суре Корана пророк Мухаммад (мир ему и благословение Аллаха) был назван именем Ахмад?",
            "answers": ["Сура \"Мухаммад\"", "Сура \"Аль-Анбия\" (Пророки)", "Сура \"Ас-Сафф\" (Ряды)", "Хочу узнать"],
            "correctAnswer": 2
        },
        {
            "question": "Какая сура в Коране была ниспослана последней?",
            "answers": ["Ан-Наср", "Ан-Нас", "Аль-Фалак", "Хочу узнать"],
            "correctAnswer": 0
        },
        {
            "question": "В какой из сур Корана клятвы упоминаются больше, чем в других сурах? В ней подряд 11 клятв.",
            "answers": ["Ан Ниса", "Аз Зумар", "Аш Шамс", "......."],
            "correctAnswer": 2
        },
        {
            "question": "За сколько дней, согласно Корану, Аллах создал этот мир - небеса, землю и то, что между ними?",
            "answers": ["За одно мгновение", "За шесть дней", "За сорок лет", "......"],
            "correctAnswer": 1
        },
        {
            "question": "Как называется глава в Коране?",
            "answers": ["Часть", "Заголовок", "Сура", "Аят"],
            "correctAnswer": 2
        },
        {
            "question": "Как называется вторая сура в Коране?",
            "answers": ["Корова", "Люди", "Рассвет", "Женщины"],
            "correctAnswer": 0
        },
        {
            "question": "Об истории какого пророка в Коране приведено больше всего аятов?",
            "answers": ["Иса", "Муса", "Мухаммад", "Иброхим"],
            "correctAnswer": 1
        },
        {
            "question": "В какой суре Корана описывается неудачный поход Абрахи на Каабу, с целью разрушить её?",
            "answers": ["Ан-Наср", "Ат-Такасур", "Аль-Филь", "Аль-Масад"],
            "correctAnswer": 2
        },
        {
            "question": "Как называется ясные для понимания аяты Корана?",
            "answers": ["Муташабих", "Мухкам", "Насс", "Тафсир", "Не знаю"],
            "correctAnswer": 1
        },
        {
            "question": "Как называются неочевидные по смыслу аяты Корана?",
            "answers": ["Муташабих", "Мухкам", "Насс", "Тафсир", "Не знаю"],
            "correctAnswer": 0
        },
        {
            "question": "Какие суры в Судный День будут идти впереди Корана и того, кто поступал в соответствии с ним(Кораном)?",
            "answers": ["Ан-Намль, Аль-Фатиха", "Аль-Фатиха, Али Имран", "Аль-Бакара, Али Имран", "Аль-Фатиха, Аль-Мульк"],
            "correctAnswer": 3
        },
        {
            "question": "В какой суре Корана \"بِسۡمِ ٱللَّهِ‎ (Бисмиллях)\" повторяется дважды?",
            "answers": ["Аль Бакара", "Ат Тин", "Ан Намль", "Аль Маида"],
            "correctAnswer": 2
        }
    
    
      // Добавьте больше вопросов по Исламу
  ],
  hadisy: [
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
  history: [
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
  all: [
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




// Проверяем, запущено ли приложение в Telegram Web App
if (window.Telegram && window.Telegram.WebApp) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user) {
        const userId = user.id; // ID пользователя
        const botUsername = "web3quiz_bot"; // Имя вашего бота
        const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;

        // Отображаем реферальную ссылку на странице
        document.getElementById("referralLink").value = referralLink;
        document.getElementById("referralLinkDisplay").innerText = referralLink;
    }
}



// Генерация реферальной ссылки
function generateReferralLink() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            const userId = user.id;
            const botUsername = "web3quiz_bot"; // Замените на имя вашего бота
            return `https://t.me/${botUsername}?start=ref_${userId}`;
        }
    }
    return "https://t.me/web3quiz_bot"; // Стандартная ссылка, если данные Telegram недоступны
}

// Отображение реферальной ссылки
function displayReferralLink() {
    const referralLink = generateReferralLink();
    document.getElementById("referralLink").value = referralLink;
    document.getElementById("referralLinkDisplay").textContent = referralLink;
}

// Копирование реферальной ссылки
function copyReferralLink() {
    const referralLink = document.getElementById("referralLink");
    referralLink.select();
    document.execCommand("copy");
    alert("Ссылка скопирована! Поделитесь ею с друзьями.");
}

// Инициализация реферальной системы при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    displayReferralLink();
    updateReferralCount();
    checkReferral();
});


// Функция для поделиться ссылкой через Telegram
function shareReferralLink() {
    const referralLink = generateReferralLink();
    const message = `Ассаляму алейкум! Присоединяйтесь к викторине! ${referralLink}`;
    
    // Если в Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Ассаляму алейкум! Присоединяйтесь к викторине!")}`);
    } 
    // Если в браузере
    else {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Ассаляму алейкум! Присоединяйтесь к викторине")}`, '_blank');
    }
}

// Получение количества приглашённых друзей
function getReferralCount() {
    return parseInt(localStorage.getItem("referralCount")) || 0;
}

// Обновление количества приглашённых друзей
function updateReferralCount() {
    const referralCount = getReferralCount();Ы
    document.getElementById("referralCount").innerText = referralCount;
}

// Проверка реферальной ссылки при загрузке страницы
function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refUserId = urlParams.get("ref");

    if (refUserId) {
        // Если это не текущий пользователь
        const currentUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "0";
        if (refUserId !== currentUserId) {
            addReferral();
        }
    }
}

// Добавление реферала
function addReferral() {
    let referralCount = getReferralCount();
    referralCount += 1;
    localStorage.setItem("referralCount", referralCount.toString());
    updateReferralCount();
    
    // Начисляем бонус
    score += 5; // 5 GEM за каждого друга
    updateGemDisplay();
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
    updateReferralCount();
    checkReferral();
});



// Обновление реферальной статистики
function updateReferralStats() {
    const referralCount = getReferralCount();
    document.getElementById("referralCount").innerText = referralCount;
    document.getElementById("referralBonus").innerText = referralCount * 5;
}

// Модифицируйте функцию addReferral
function addReferral() {
    let referralCount = getReferralCount();
    referralCount += 1;
    localStorage.setItem("referralCount", referralCount.toString());
    
    score += 5;
    updateGemDisplay();
    updateReferralStats();
    
    // Анимация
    animateStatUpdate();
}

// Анимация обновления статистики
function animateStatUpdate() {
    const stats = document.querySelectorAll(".stat-value");
    stats.forEach(stat => {
        stat.classList.add("updated");
        setTimeout(() => {
            stat.classList.remove("updated");
        }, 300);
    });
}

// Добавьте в DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    updateReferralStats();
    checkReferral();
});