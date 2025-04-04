// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6quHrp9tQbLwjUWrupw1C4ljQfPk3uNA",
  authDomain: "myquizapp-786ee.firebaseapp.com",
  databaseURL: "https://myquizapp-786ee-default-rtdb.firebaseio.com",
  projectId: "myquizapp-786ee",
  storageBucket: "myquizapp-786ee.appspot.com",
  messagingSenderId: "351619904262",
  appId: "1:351619904262:web:67133361608fb0e22ce487"
};

// Основные переменные
let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = [];
let userData = null;
let userId = null;
let referralCount = parseInt(localStorage.getItem("referralCount")) || 0;
let questionsByCategory = {
  quran: [],
  hadisy: [],
  history: [],
  all: []
};

// Временные вопросы (если Firebase недоступен)
const temporaryQuestions = {
  quran: [
    {
      question: "Сколько сур в Коране?",
      answers: ["114", "113", "115", "112"],
      correctAnswer: 0
    },
    {
      question: "Какая сура называется 'Сердцем Корана'?",
      answers: ["Аль-Бакара", "Ясин", "Аль-Фатиха", "Аль-Ихлас"],
      correctAnswer: 1
    },
    {
      question: "Сколько джузов в Коране?",
      answers: ["20", "30", "40", "50"],
      correctAnswer: 1
    }
  ],
  hadisy: [
    {
      question: "Что Пророк (ﷺ) назвал 'главой дел'?",
      answers: ["Намаз", "Пост", "Намерение", "Закят"],
      correctAnswer: 2
    },
    {
      question: "Кто будет тенью Аллаха в Судный день?",
      answers: ["Ученый", "Имам", "Правитель", "Милостивый"],
      correctAnswer: 2
    }
  ],
  history: [
    {
      question: "Кто был первым халифом после Пророка (ﷺ)?",
      answers: ["Умар ибн аль-Хаттаб", "Абу Бакр ас-Сиддик", "Усман ибн Аффан", "Али ибн Абу Талиб"],
      correctAnswer: 1
    },
    {
      question: "В каком году произошла Хиджра?",
      answers: ["610 г.", "622 г.", "630 г.", "632 г."],
      correctAnswer: 1
    }
  ]
};
temporaryQuestions.all = [...temporaryQuestions.quran, ...temporaryQuestions.hadisy, ...temporaryQuestions.history];

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Инициализация Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    initTelegramWebApp();
    await loadQuestionsFromFirebase();
    await initUserData();
    updateProfile();
    updateReferralStats();
    checkReferral();
    showPage('home');
    setupCopyProtection();
  } catch (error) {
    console.error("Ошибка инициализации:", error);
    questionsByCategory = temporaryQuestions;
    showPage('home');
  }
});

// ==================== Firebase Functions ====================

// Загрузка вопросов из Firebase
async function loadQuestionsFromFirebase() {
  try {
    const snapshot = await firebase.database().ref('questions').once('value');
    const firebaseQuestions = snapshot.val();
    
    if (firebaseQuestions) {
      questionsByCategory = firebaseQuestions;
      
      // Перемешиваем вопросы для каждой категории
      for (const category in questionsByCategory) {
        if (questionsByCategory[category] && questionsByCategory[category].length > 0) {
          questionsByCategory[category] = shuffleArray(questionsByCategory[category]);
        }
      }
      
      // Обновляем объединенную категорию
      questionsByCategory.all = [
        ...(questionsByCategory.quran || []),
        ...(questionsByCategory.hadisy || []),
        ...(questionsByCategory.history || [])
      ];
    } else {
      questionsByCategory = temporaryQuestions;
    }
  } catch (error) {
    console.error("Ошибка загрузки вопросов:", error);
    questionsByCategory = temporaryQuestions;
  }
}

// Инициализация данных пользователя
// Инициализация пользователя с улучшенной обработкой ошибок
async function initUserData() {
  try {
    // Загрузка из localStorage
    const savedScore = parseInt(localStorage.getItem("quizScore")) || 0;
    const savedRefCount = parseInt(localStorage.getItem("referralCount")) || 0;
    
    score = savedScore;
    referralCount = savedRefCount;

    // Проверка Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && Telegram.WebApp.initDataUnsafe.user) {
      userData = Telegram.WebApp.initDataUnsafe.user;
      userId = userData.id.toString();
      
      const userRef = firebase.database().ref('users/' + userId);
      
      // Проверяем существование пользователя
      const snapshot = await userRef.once('value');
      
      if (!snapshot.exists()) {
        // Новый пользователь
        const userDataToSave = {
          id: userId,
          firstName: userData.first_name || 'Гость',
          lastName: userData.last_name || '',
          username: userData.username || '',
          score: score,
          referrals: referralCount,
          lastActive: firebase.database.ServerValue.TIMESTAMP,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          isTelegramUser: true
        };
        
        console.log("Создаем нового пользователя:", userDataToSave);
        await userRef.set(userDataToSave);
      } else {
        // Существующий пользователь
        const user = snapshot.val();
        console.log("Найден существующий пользователь:", user);
        
        // Обновляем только необходимые поля
        const updates = {
          score: user.score !== undefined ? user.score : score,
          referrals: user.referrals !== undefined ? user.referrals : referralCount,
          lastActive: firebase.database.ServerValue.TIMESTAMP
        };
        
        console.log("Обновляем пользователя:", updates);
        await userRef.update(updates);
        
        // Синхронизируем локальные данные
        score = user.score || score;
        referralCount = user.referrals || referralCount;
        localStorage.setItem("quizScore", score);
        localStorage.setItem("referralCount", referralCount);
      }
    } else {
      // Гостевой режим
      userId = "guest_" + Math.random().toString(36).substr(2, 9);
      console.log("Гостевой режим, ID:", userId);
    }
    
    updateGemDisplay();
    console.log("Данные пользователя инициализированы. Текущий счет:", score);
  } catch (error) {
    console.error("Ошибка инициализации пользователя:", error);
    userId = "guest_" + Math.random().toString(36).substr(2, 9);
    updateGemDisplay();
  }
}

// Улучшенная функция обновления данных
async function updateUserData(updates) {
  try {
    if (!userId.startsWith("guest_")) {
      console.log("Обновление данных пользователя:", updates);
      const userRef = firebase.database().ref('users/' + userId);
      
      // Добавляем timestamp обновления
      const fullUpdates = {
        ...updates,
        lastActive: firebase.database.ServerValue.TIMESTAMP
      };
      
      await userRef.update(fullUpdates);
      console.log("Данные успешно обновлены");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Ошибка обновления данных:", error);
    return false;
  }
}

// Обновление счета с улучшенной обработкой
async function updateScore(points) {
  try {
    const newScore = score + points;
    console.log(`Обновление счета: ${score} + ${points} = ${newScore}`);
    
    score = newScore;
    localStorage.setItem("quizScore", score);
    updateGemDisplay();
    
    if (!userId.startsWith("guest_")) {
      const result = await updateUserData({ score: score });
      if (!result) {
        console.warn("Не удалось сохранить счет в Firebase");
      }
    }
  } catch (error) {
    console.error("Ошибка обновления счета:", error);
  }
}

// Сохранение покупки в Firebase
async function savePurchase(itemName, price) {
  try {
    if (!userId.startsWith("guest_")) {
      await firebase.database().ref(`users/${userId}/purchases`).push({
        item: itemName,
        price: price,
        date: firebase.database.ServerValue.TIMESTAMP
      });
    }
  } catch (error) {
    console.error("Ошибка сохранения покупки:", error);
  }
}

// ==================== Quiz Functions ====================

// Начало викторины
function startQuiz(category) {
  if (!questionsByCategory[category] || questionsByCategory[category].length === 0) {
    alert("Вопросы загружаются, попробуйте позже");
    return;
  }
  
  shuffledQuestions = [...questionsByCategory[category]];
  currentQuestionIndex = 0;
  showPage('quiz');
  loadQuestion();
}

// Загрузка вопроса
function loadQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length) {
    currentQuestionIndex = 0;
    shuffledQuestions = shuffleArray(shuffledQuestions);
  }

  const questionData = shuffledQuestions[currentQuestionIndex];
  const questionElement = document.getElementById("question");
  const answersContainer = document.getElementById("answers");
  const nextButton = document.getElementById("nextQuestion");

  // Сброс предыдущего состояния
  questionElement.classList.remove("show");
  nextButton.classList.remove("show");
  answersContainer.innerHTML = "";

  // Анимация появления
  setTimeout(() => {
    questionElement.textContent = questionData.question;
    questionElement.classList.add("show");

    // Добавление вариантов ответов
    questionData.answers.forEach((answer, index) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.textContent = answer;
      button.onclick = () => checkAnswer(index);
      setTimeout(() => button.classList.add("show"), index * 100);
      answersContainer.appendChild(button);
    });

    setTimeout(() => nextButton.classList.add("show"), 500);
  }, 300);
}

// Проверка ответа
function checkAnswer(index) {
  const questionData = shuffledQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll(".answer-button");

  // Отключение всех кнопок
  buttons.forEach(button => button.disabled = true);

  if (index === questionData.correctAnswer) {
    // Правильный ответ
    buttons[index].classList.add("correct");
    updateScore(1);
  } else {
    // Неправильный ответ
    buttons[index].classList.add("incorrect");
    buttons[questionData.correctAnswer].classList.add("correct");
  }

  // Автопереход к следующему вопросу
  setTimeout(loadNextQuestion, 1500);
}

// Следующий вопрос
function loadNextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

// ==================== User Functions ====================

// Обновление счета
async function updateScore(points) {
  score += points;
  localStorage.setItem("quizScore", score);
  
  if (!userId.startsWith("guest_")) {
    await updateUserData({ score: score });
  }
  
  updateGemDisplay();
}

// Обновление отображения GEM
function updateGemDisplay() {
  document.getElementById("profileGemCount").textContent = score;
  document.getElementById("gemBalance").textContent = score;
  document.getElementById("modalUserGem").textContent = score;
}

// Инициализация Telegram WebApp
function initTelegramWebApp() {
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    userData = Telegram.WebApp.initDataUnsafe.user;
  }
}

// Обновление профиля
function updateProfile() {
  const profileName = document.getElementById("profileName");
  if (userData) {
    profileName.textContent = `${userData.first_name} ${userData.last_name || ''}`.trim();
  } else {
    profileName.textContent = "Гость";
  }
}

// ==================== REFERRAL SYSTEM ====================

let referralCode = null;

// Проверка реферальной ссылки при загрузке
function checkReferral() {
// Получаем параметры URL
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');

if (refCode) {
  // Сохраняем реферальный код
  referralCode = refCode;
  localStorage.setItem('lastReferral', refCode);
  console.log('Найден реферальный код:', refCode);
  
  // Проверяем, чтобы пользователь не ссылался сам на себя
  if (!userId.startsWith("guest_") && refCode !== userId) {
    processReferral(refCode);
  }
}
}

// Обработка реферала
async function processReferral(referrerId) {
try {
  // 1. Проверяем, не активировал ли уже пользователь этот реферальный код
  const activatedReferrals = JSON.parselocalStorage.getItem('activatedReferrals') || [];
  
  if (activatedReferrals.includes(referrerId)) {
    console.log('Реферальный код уже был активирован ранее');
    return;
  }

  // 2. Добавляем реферала к пользователю
  const referrerRef = firebase.database().ref(`users/${referrerId}`);
  
  // Используем транзакцию для безопасного обновления
  await referrerRef.transaction((user) => {
    if (user) {
      user.referrals = (user.referrals || 0) + 1;
      user.score = (user.score || 0) + 50; // 5 GEM за реферала
    }
    return user;
  });

  // 3. Начисляем бонус новому пользователю
  await updateScore(5); // 5 GEM за использование кода
  referralCount += 1;
  localStorage.setItem("referralCount", referralCount);
  
  // 4. Сохраняем информацию об активации
  activatedReferrals.push(referrerId);
  localStorage.setItem('activatedReferrals', JSON.stringify(activatedReferrals));
  
  console.log('Реферальный код успешно активирован! Начислено 5 GEM');
  
  // Обновляем статистику
  updateReferralStats();
  
} catch (error) {
  console.error('Ошибка обработки реферального кода:', error);
}
}

// Генерация реферальной ссылки
function generateReferralLink() {
if (!userId) return 'https://t.me/web3quiz_bot';

// Для Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  return `https://t.me/web3quiz_bot?start=ref_${userId}`;
}

// Для обычного браузера
return `${window.location.origin}${window.location.pathname}?ref=${userId}`;
}

// Поделиться реферальной ссылкой
function shareReferralLink() {
const link = generateReferralLink();

// В Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.shareUrl(link, "Присоединяйся к Исламской Викторине!");
  return;
}

// В обычном браузере
if (navigator.share) {
  navigator.share({
    title: 'Исламская Викторина',
    text: 'Проверь свои знания и зарабатывай GEM!',
    url: link
  }).catch(() => copyToClipboard(link));
} else {
  copyToClipboard(link);
}
}

// Копирование в буфер обмена
function copyToClipboard(text) {
navigator.clipboard.writeText(text).then(() => {
  alert('Ссылка скопирована в буфер обмена!\n' + text);
}).catch(() => {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  alert('Ссылка скопирована: ' + text);
});
}

// Обновление статистики рефералов
function updateReferralStats() {
document.getElementById("referralCount").textContent = referralCount;
document.getElementById("referralBonus").textContent = referralCount * 5;

// Обновляем в Firebase
if (!userId.startsWith("guest_")) {
  firebase.database().ref(`users/${userId}`).update({
    referrals: referralCount
  });
}
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener("DOMContentLoaded", async () => {
// ... остальная инициализация ...

// Инициализируем реферальную систему
checkReferral();
updateReferralStats();

// Для кнопки "Пригласить друзей"
document.querySelector('.action-btn[onclick="shareReferralLink()"]')
  .addEventListener('click', shareReferralLink);
});

// ==================== Shop Functions ====================

// Переворот книги
function flipBook(book) {
  book.classList.toggle("flipped");
}

// Покупка товара
async function buyItem(price, itemName, event) {
  event.stopPropagation();
  if (score >= price) {
    await updateScore(-price);
    await savePurchase(itemName, price);
    alert(`Вы купили: "${itemName}" за ${price} GEM`);
  } else {
    alert("Недостаточно GEM!");
  }
}

// ==================== Leaderboard Functions ====================

// Загрузка таблицы лидеров
async function loadLeaderboard() {
  try {
    const leaderboardElement = document.getElementById("leaderboard");
    leaderboardElement.innerHTML = "<li class='loading'>Загрузка рейтинга...</li>";

    const snapshot = await firebase.database().ref('users')
      .orderByChild('score')
      .limitToLast(10)
      .once('value');

    const users = [];
    snapshot.forEach(childSnapshot => {
      const user = childSnapshot.val();
      user.id = childSnapshot.key;
      if (user.score > 0) {
        users.push(user);
      }
    });

    // Сортировка по убыванию
    users.sort((a, b) => (b.score || 0) - (a.score || 0));

    leaderboardElement.innerHTML = '';
    
    if (users.length === 0) {
      leaderboardElement.innerHTML = "<li class='no-data'>Нет данных о пользователях</li>";
      return;
    }

    const topIcons = ['🥇', '🥈', '🥉'];
    
    users.forEach((user, index) => {
      const li = document.createElement("li");
      li.className = "leader-item";
      
      li.innerHTML = `
        <span class="leader-pos">${index < 3 ? topIcons[index] : index + 1}</span>
        <span class="leader-name">${user.firstName || 'Аноним'} ${user.lastName || ''}</span>
        <span class="leader-score">${user.score || 0} GEM</span>
      `;
      
      if (index < 3) {
        li.classList.add(`top-${index + 1}`);
      }
      
      leaderboardElement.appendChild(li);
    });

  } catch (error) {
    console.error("Ошибка загрузки таблицы лидеров:", error);
    document.getElementById("leaderboard").innerHTML = 
      "<li class='error'>Ошибка загрузки. Проверьте соединение.</li>";
  }
}

// ==================== UI Functions ====================

// Переключение страниц
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
  });
  
  const pageElement = document.getElementById(`${pageId}-page`);
  if (pageElement) {
    pageElement.style.display = "block";
    
    // Специальные действия для некоторых страниц
    if (pageId === 'leaders') {
      loadLeaderboard();
    } else if (pageId === 'shop') {
      updateGemDisplay();
    }
  }

  // Обновление активной кнопки навигации
  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.remove("active");
  });
  
  const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

// Модальное окно профиля
function openProfileModal() {
  const modal = document.getElementById("profileModal");
  modal.style.display = "flex";
  document.getElementById("modalUserGem").textContent = score;
  
  if (userData) {
    document.getElementById("modalUserName").textContent = 
      `${userData.first_name} ${userData.last_name || ''}`.trim();
    document.getElementById("modalUserId").textContent = userData.id || "Не определен";
  } else {
    document.getElementById("modalUserName").textContent = "Гость";
    document.getElementById("modalUserId").textContent = "Гостевой режим";
  }
}

function closeProfileModal() {
  document.getElementById("profileModal").style.display = "none";
}

// Обработчик клика вне модального окна
window.onclick = function(event) {
  if (event.target === document.getElementById("profileModal")) {
    closeProfileModal();
  }
};

// ==================== Utility Functions ====================

// Перемешивание массива
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Защита от копирования
function setupCopyProtection() {
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showCopyAlert();
  });
  
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'v', 'V', 'a', 'A', 'x', 'X'].includes(e.key)) {
      e.preventDefault();
      showCopyAlert();
    }
  });
  
  function showCopyAlert() {
    if (window.Telegram && window.Telegram.WebApp) {
      Telegram.WebApp.showAlert('Копирование запрещено');
    } else {
      alert('Копирование запрещено');
    }
  }
}

// Подписка на Telegram
function subscribeTelegram() {
  window.open("https://t.me/islamskie_viktorini", "_blank");
  updateScore(10);
  alert("+10 GEM за подписку!");
}

// Начало игры 1vs1
function startOneVsOne() {
  showPage('one-vs-one');
  document.getElementById("status").textContent = "Поиск соперника...";
  // Здесь должна быть реализация поиска соперника
  setTimeout(() => {
    document.getElementById("status").textContent = "Соперник не найден. Попробуйте позже.";
  }, 5000);
}

// Добавление нового вопроса (для админа)
async function addQuestionToFirebase(category, questionData) {
  try {
    const newQuestionRef = firebase.database().ref(`questions/${category}`).push();
    await newQuestionRef.set(questionData);
    console.log("Вопрос добавлен с ID:", newQuestionRef.key);
    return true;
  } catch (error) {
    console.error("Ошибка добавления вопроса:", error);
    return false;
  }
}


// ==================== REFERRAL SHARE FUNCTION ====================

function shareReferralLink() {
  const referralLink = generateReferralLink();
  const message = `Присоединяйся к Исламской Викторине! 🕌\nПроверь свои знания и зарабатывай GEM!\n\nМоя реферальная ссылка: ${referralLink}\n\n#Ислам #Викторина #Quiz`;
  
  // Для мобильных устройств (Android/iOS)
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Попробуем открыть Telegram
    window.open(`tg://msg?text=${encodeURIComponent(message)}`, '_blank');
    
    // Фолбэк для iOS
    setTimeout(() => {
      if (document.hidden) return;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
    }, 200);
  }
  // Для Desktop версии Telegram
  else if (navigator.userAgent.includes('Telegram')) {
    Telegram.WebApp.shareUrl(referralLink, "Присоединяйся к Исламской Викторине!");
  }
  // Для веб-версии (копирование + alert)
  else {
    copyToClipboard(referralLink, message);
  }
}

// Улучшенная функция копирования с сообщением
function copyToClipboard(link, message) {
  navigator.clipboard.writeText(message || link).then(() => {
    alert('Реферальная ссылка скопирована! Вставьте её в любой мессенджер:\n\n' + link);
  }).catch(() => {
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = message || link;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      alert('Ссылка скопирована! Вставьте её в любой мессенджер:\n\n' + link);
    } catch (err) {
      alert('Не удалось скопировать ссылку. Скопируйте вручную:\n\n' + link);
    }
    
    document.body.removeChild(textarea);
  });
}

// Генерация реферальной ссылки
function generateReferralLink() {
  if (!userId) return 'https://t.me/web3quiz_bot';
  
  // Для Telegram
  if (window.Telegram && window.Telegram.WebApp) {
    return `https://t.me/web3quiz_bot?start=ref_${userId}`;
  }
  
  // Для других платформ
  return `${window.location.origin}?ref=${userId}`;
}

// ==================== UI КНОПКА ====================

// Добавьте этот код в инициализацию
document.addEventListener("DOMContentLoaded", () => {
  const shareBtn = document.querySelector('.action-btn[onclick*="shareReferralLink"]');
  if (shareBtn) {
    shareBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      shareReferralLink();
    });
  }
});