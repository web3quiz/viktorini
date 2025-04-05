// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6quHrp9tQbLwjUWrupw1C4ljQfPk3uNA",
  authDomain: "myquizapp-786ee.firebaseapp.com",
  databaseURL: "https://myquizapp-786ee-default-rtdb.firebaseio.com",
  projectId: "myquizapp-786ee",
  storageBucket: "myquizapp-786ee.appspot.com",
  messagingSenderId: "351619904262",
  appId: "1:351619904262:web:67133361608fb0e22ce487"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// App variables
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

// Temporary questions
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
    }
  ],
  hadisy: [
    {
      question: "Что Пророк (ﷺ) назвал 'главой дел'?",
      answers: ["Намаз", "Пост", "Намерение", "Закят"],
      correctAnswer: 2
    }
  ],
  history: [
    {
      question: "Кто был первым халифом после Пророка (ﷺ)?",
      answers: ["Умар ибн аль-Хаттаб", "Абу Бакр ас-Сиддик", "Усман ибн Аффан", "Али ибн Абу Талиб"],
      correctAnswer: 1
    }
  ]
};
temporaryQuestions.all = [...temporaryQuestions.quran, ...temporaryQuestions.hadisy, ...temporaryQuestions.history];

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  try {
    initTelegramWebApp();
    await loadQuestionsFromFirebase();
    await initUserData();
    updateProfile();
    updateReferralStats();
    checkReferral();
    showPage('home');
    setupCopyProtection();
    
    // Test connection
    firebase.database().ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        console.log("Connected to Firebase");
      } else {
        console.log("Not connected to Firebase");
      }
    });
  } catch (error) {
    console.error("Initialization error:", error);
    questionsByCategory = temporaryQuestions;
  }
});

// ==================== Firebase Functions ====================

async function loadQuestionsFromFirebase() {
  try {
    const snapshot = await firebase.database().ref('questions').once('value');
    if (snapshot.exists()) {
      questionsByCategory = snapshot.val();
    } else {
      questionsByCategory = temporaryQuestions;
    }
  } catch (error) {
    console.error("Load questions error:", error);
    questionsByCategory = temporaryQuestions;
  }
}

async function initUserData() {
  // Load from localStorage
  score = parseInt(localStorage.getItem("quizScore")) || 0;
  referralCount = parseInt(localStorage.getItem("referralCount")) || 0;

  // Check Telegram user
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    userData = Telegram.WebApp.initDataUnsafe.user;
    userId = userData.id.toString();
    
    try {
      const userRef = firebase.database().ref('users/' + userId);
      const snapshot = await userRef.once('value');
      
      if (!snapshot.exists()) {
        // Create new user
        await userRef.set({
          id: userId,
          firstName: userData.first_name,
          lastName: userData.last_name || '',
          username: userData.username || '',
          score: score,
          referrals: referralCount,
          lastActive: firebase.database.ServerValue.TIMESTAMP,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        });
      } else {
        // Update existing user
        const user = snapshot.val();
        score = user.score || score;
        referralCount = user.referrals || referralCount;
        localStorage.setItem("quizScore", score);
        localStorage.setItem("referralCount", referralCount);
        
        await userRef.update({ 
          lastActive: firebase.database.ServerValue.TIMESTAMP 
        });
      }
    } catch (error) {
      console.error("User init error:", error);
      userId = "guest_" + Math.random().toString(36).substr(2, 9);
    }
  } else {
    // Guest mode
    userId = "guest_" + Math.random().toString(36).substr(2, 9);
  }
  
  updateGemDisplay();
}

async function updateUserData(updates) {
  try {
    if (!userId.startsWith("guest_")) {
      await firebase.database().ref('users/' + userId).update({
        ...updates,
        lastActive: firebase.database.ServerValue.TIMESTAMP
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Update error:", error);
    return false;
  }
}

// ==================== Quiz Functions ====================

function startQuiz(category) {
  console.log(`Starting quiz for category: ${category}`, questionsByCategory[category]);
  if (!questionsByCategory[category]?.length) {
    alert("Вопросы загружаются, попробуйте позже");
    return;
  }
  shuffledQuestions = [...questionsByCategory[category]];
  currentQuestionIndex = 0;
  showPage('quiz');
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length) {
    currentQuestionIndex = 0;
    shuffledQuestions = shuffleArray(shuffledQuestions);
  }

  const questionElement = document.getElementById("question");
  const answersContainer = document.getElementById("answers");
  const nextButton = document.getElementById("nextQuestion");

  // Reset state
  questionElement.classList.remove("show");
  nextButton.classList.remove("show");
  answersContainer.innerHTML = "";

  // Show question with animation
  setTimeout(() => {
    const questionData = shuffledQuestions[currentQuestionIndex];
    questionElement.textContent = questionData.question;
    questionElement.classList.add("show");

    // Add answer buttons
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

function checkAnswer(index) {
  const questionData = shuffledQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll(".answer-button");

  // Disable all buttons
  buttons.forEach(btn => btn.disabled = true);

  if (index === questionData.correctAnswer) {
    // Correct answer
    buttons[index].classList.add("correct");
    updateScore(1);
  } else {
    // Wrong answer
    buttons[index].classList.add("incorrect");
    buttons[questionData.correctAnswer].classList.add("correct");
  }

  // Auto proceed to next question
  setTimeout(loadNextQuestion, 1500);
}

function loadNextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

// ==================== User Functions ====================

async function updateScore(points) {
  score += points;
  localStorage.setItem("quizScore", score);
  
  if (!userId.startsWith("guest_")) {
    await updateUserData({ score: score });
  }
  
  updateGemDisplay();
}

function updateGemDisplay() {
  document.getElementById("profileGemCount").textContent = score;
  document.getElementById("gemBalance").textContent = score;
  document.getElementById("modalUserGem").textContent = score;
}

function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    userData = Telegram.WebApp.initDataUnsafe.user;
  }
}

function updateProfile() {
  const profileName = document.getElementById("profileName");
  if (userData) {
    profileName.textContent = `${userData.first_name} ${userData.last_name || ''}`.trim();
  } else {
    profileName.textContent = "Гость";
  }
}

// ==================== Referral System ====================

function checkReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const refUserId = urlParams.get("ref");

  if (refUserId && refUserId !== userId) {
    const activatedReferrals = JSON.parse(localStorage.getItem('activatedReferrals')) || [];
    if (!activatedReferrals.includes(refUserId)) {
      activatedReferrals.push(refUserId);
      localStorage.setItem('activatedReferrals', JSON.stringify(activatedReferrals));
      addReferral();
      
      // Add bonus to referrer
      if (!refUserId.startsWith("guest_")) {
        firebase.database().ref('users/' + refUserId).transaction(user => {
          if (user) user.score = (user.score || 0) + 5;
          return user;
        });
      }
    }
  }
}

async function addReferral() {
  referralCount++;
  localStorage.setItem("referralCount", referralCount);
  await updateScore(5);
  updateReferralStats();
  
  if (!userId.startsWith("guest_")) {
    await updateUserData({ referrals: referralCount });
  }
}

function updateReferralStats() {
  document.getElementById("referralCount").textContent = referralCount;
  document.getElementById("referralBonus").textContent = referralCount * 5;
}

function generateReferralLink() {
  if (!userId) return 'https://t.me/web3quiz_bot';
  return `https://t.me/web3quiz_bot?start=ref_${userId}`;
}

function shareReferralLink() {
  const link = `https://t.me/${CHANNEL_USERNAME.substring(1)}`;
  
  if (window.Telegram?.WebApp?.shareUrl) {
    Telegram.WebApp.shareUrl(link, "Подпишитесь на наш канал с исламскими викторинами!");
  } else if (navigator.share) {
    navigator.share({
      title: 'Исламские Викторины',
      text: 'Подпишитесь на наш канал с интересными викторинами!',
      url: link
    }).catch(() => copyToClipboard(link));
  } else {
    copyToClipboard(link);
  }
}

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

// ==================== Leaderboard Functions ====================

async function loadLeaderboard() {
  const leaderboardElement = document.getElementById("leaderboard");
  
  try {
    // Show loading state
    leaderboardElement.innerHTML = `
      <li class="loading">
        <div class="loading-spinner"></div>
        <span>Загрузка рейтинга...</span>
      </li>
    `;

    // Get top 10 players
    const snapshot = await firebase.database().ref('users')
      .orderByChild('score')
      .limitToLast(10)
      .once('value');

    const users = [];
    snapshot.forEach(childSnapshot => {
      const user = childSnapshot.val();
      console.log("User data:", user);
      if (user?.score !== undefined) {
        users.push({
          id: childSnapshot.key,
          name: `${user.firstName || user.first_name || 'Аноним'} ${user.lastName || user.last_name || ''}`.trim(),
          score: user.score || 0
        });
      }
    });
    console.log("Processed users:", users);

    // Sort by score (descending)
    users.sort((a, b) => b.score - a.score);

    // Render or show message
    if (users.length > 0) {
      renderLeaderboard(leaderboardElement, users);
    } else {
      showNoDataMessage(leaderboardElement);
    }
    
  } catch (error) {
    console.error("Leaderboard error:", error);
    showErrorMessage(leaderboardElement);
  }
}

function renderLeaderboard(element, users) {
  const topIcons = ['🥇', '🥈', '🥉'];
  
  element.innerHTML = users.map((user, index) => `
    <li class="leader-item ${index < 3 ? `top-${index + 1}` : ''}">
      <span class="leader-position">${index < 3 ? topIcons[index] : index + 1}</span>
      <span class="leader-name">${user.name}</span>
      <span class="leader-score">${user.score} GEM</span>
    </li>
  `).join('');
}

function showNoDataMessage(element) {
  element.innerHTML = `
    <li class="no-data">
      <img src="icons/no-data.svg" alt="Нет данных">
      <span>Пока никто не участвовал</span>
    </li>
  `;
}

function showErrorMessage(element) {
  element.innerHTML = `
    <li class="error">
      <img src="icons/error.svg" alt="Ошибка">
      <div>
        <span>Ошибка загрузки</span>
        <button class="retry-button">Повторить</button>
      </div>
    </li>
  `;
  
  // Add event listener for retry button
  element.querySelector('.retry-button').addEventListener('click', loadLeaderboard);
}

// ==================== Shop Functions ====================

function flipBook(book) {
  book.classList.toggle("flipped");
}

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
    console.error("Save purchase error:", error);
  }
}

// ==================== UI Functions ====================

function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
  });
  
  // Show requested page
  const pageElement = document.getElementById(`${pageId}-page`);
  if (pageElement) {
    pageElement.style.display = "block";
    
    // Special actions for some pages
    if (pageId === 'leaders') loadLeaderboard();
    if (pageId === 'shop') updateGemDisplay();
  }
  
  // Update active nav button
  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.remove("active");
  });
  
  const activeButton = document.querySelector(`.nav-button[onclick*="showPage('${pageId}')"]`);
  if (activeButton) activeButton.classList.add("active");
}

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

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target === document.getElementById("profileModal")) {
    closeProfileModal();
  }
};

// ==================== Utility Functions ====================

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.showAlert('Копирование запрещено');
    } else {
      alert('Копирование запрещено');
    }
  }
}

async function subscribeTelegram() {
  try {
    // Проверяем, есть ли пользователь в Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const userId = Telegram.WebApp.initDataUnsafe.user.id;
      
      // Проверяем подписку
      const isSubscribed = await checkSubscription(userId);
      
      if (isSubscribed) {
        updateScore(10);
        alert("Спасибо за подписку! +10 GEM на ваш счет.");
      } else {
        // Если не подписан, открываем канал и просим подписаться
        window.open(`https://t.me/${CHANNEL_USERNAME.substring(1)}`, "_blank");
        alert("Пожалуйста, подпишитесь на канал и нажмите кнопку снова, чтобы получить бонус.");
      }
    } else {
      // Для пользователей вне Telegram просто открываем канал
      window.open(`https://t.me/${CHANNEL_USERNAME.substring(1)}`, "_blank");
      alert("Пожалуйста, подпишитесь на канал и вернитесь в приложение, чтобы получить бонус.");
    }
  } catch (error) {
    console.error("Subscribe error:", error);
    alert("Произошла ошибка при проверке подписки.");
  }
}

function startOneVsOne() {
  showPage('one-vs-one');
  document.getElementById("status").textContent = "Поиск соперника...";
  setTimeout(() => {
    document.getElementById("status").textContent = "Соперник не найден. Попробуйте позже.";
  }, 5000);
}





function shareReferralLink() {
  console.log("Функция shareReferralLink вызвана"); // Добавьте эту строку
  const link = generateReferralLink();
  console.log("Сгенерированная ссылка:", link); // И эту
  
  if (window.Telegram?.WebApp) {
    console.log("Используем Telegram WebApp.shareUrl");
    Telegram.WebApp.shareUrl(link, "Присоединяйся к Исламской Викторине!");
  } else if (navigator.share) {
    console.log("Используем Web Share API");
    navigator.share({
      title: 'Исламская Викторина',
      text: 'Проверь свои знания и зарабатывай GEM!',
      url: link
    }).catch((error) => {
      console.error("Ошибка Web Share API:", error);
      copyToClipboard(link);
    });
  } else {
    console.log("Используем fallback - копирование в буфер");
    copyToClipboard(link);
  }
}


function shareReferralLink() {
  const link = generateReferralLink();
  
  try {
    if (window.Telegram?.WebApp?.shareUrl) {
      Telegram.WebApp.shareUrl(link, "Присоединяйся к Исламской Викторине!");
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'Исламская Викторина',
        text: 'Проверь свои знания и зарабатывай GEM!',
        url: link
      }).catch(() => copyToClipboardWithAlert(link));
      return;
    }

    // Fallback для всех остальных случаев
    copyToClipboardWithAlert(link);
  } catch (e) {
    console.error("Ошибка при попытке поделиться:", e);
    copyToClipboardWithAlert(link);
  }
}

function copyToClipboardWithAlert(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Ссылка скопирована: ' + text);
  }).catch(() => {
    // Fallback для старых браузеров
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Ссылка скопирована в буфер: ' + text);
  });
}



// Константы для бота и канала
const CHANNEL_USERNAME = '@islamskie_viktorini'; // Убедитесь, что username правильный

// Функция для проверки подписки через бота
function checkSubscription() {
  return new Promise((resolve) => {
    if (!window.Telegram?.WebApp) {
      console.log("Not in Telegram WebApp");
      resolve(false);
      return;
    }

    // Создаем обработчик для ответа от бота
    Telegram.WebApp.onEvent('subscriptionChecked', (data) => {
      console.log("Subscription check result:", data);
      resolve(data.isSubscribed);
    });

    // Отправляем запрос боту на проверку подписки
    Telegram.WebApp.sendData(JSON.stringify({
      action: 'check_subscription',
      channel: CHANNEL_USERNAME
    }));
  });
}

// Обновленная функция подписки
async function subscribeTelegram() {
  try {
    if (!window.Telegram?.WebApp) {
      window.open(`https://t.me/${CHANNEL_USERNAME.substring(1)}`, "_blank");
      alert("Пожалуйста, подпишитесь на канал в Telegram");
      return;
    }

    const isSubscribed = await checkSubscription();
    
    if (isSubscribed) {
      updateScore(10);
      alert("Спасибо за подписку! +10 GEM на ваш счет.");
    } else {
      Telegram.WebApp.openTelegramLink(`https://t.me/${CHANNEL_USERNAME.substring(1)}`);
      alert("Пожалуйста, подпишитесь на канал и нажмите кнопку снова, чтобы получить бонус.");
    }
  } catch (error) {
    console.error("Subscribe error:", error);
    alert("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
}

