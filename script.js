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
    await initializeFirebaseAuth(); // Добавлена аутентификация
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

// ==================== Authentication ====================
async function initializeFirebaseAuth() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    userData = Telegram.WebApp.initDataUnsafe.user;
    userId = userData.id.toString();
    
    try {
      // Аутентифицируемся анонимно в Firebase
      await firebase.auth().signInAnonymously();
      console.log("Authenticated with Firebase");
      
      // Связываем Telegram ID с Firebase UID
      await firebase.database().ref(`user_mappings/${userId}`).set({
        firebaseUid: firebase.auth().currentUser.uid,
        lastActive: firebase.database.ServerValue.TIMESTAMP
      });
      
    } catch (error) {
      console.error("Firebase auth error:", error);
      userId = "guest_" + Math.random().toString(36).substr(2, 9);
    }
  } else {
    // Guest mode
    userId = "guest_" + Math.random().toString(36).substr(2, 9);
    try {
      await firebase.auth().signInAnonymously();
    } catch (error) {
      console.error("Guest auth failed:", error);
    }
  }
}

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

  if (userId && !userId.startsWith("guest_")) {
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
    }
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
    try {
      await firebase.database().ref('users/' + userId).update({
        score: score,
        lastActive: firebase.database.ServerValue.TIMESTAMP
      });
    } catch (error) {
      console.error("Score update error:", error);
    }
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
    if (Telegram.WebApp.initDataUnsafe?.user) {
      userData = Telegram.WebApp.initDataUnsafe.user;
    }
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

// ==================== Leaderboard Functions ====================
async function loadLeaderboard() {
  const leaderboardElement = document.getElementById("leaderboard");
  
  try {
    leaderboardElement.innerHTML = `
      <li class="loading">
        <div class="loading-spinner"></div>
        <span>Загрузка рейтинга...</span>
      </li>
    `;

    const snapshot = await firebase.database().ref('users')
      .orderByChild('score')
      .limitToLast(10)
      .once('value');

    const users = [];
    snapshot.forEach(childSnapshot => {
      const user = childSnapshot.val();
      if (user?.score !== undefined) {
        users.push({
          id: childSnapshot.key,
          name: `${user.firstName || user.first_name || 'Аноним'} ${user.lastName || user.last_name || ''}`.trim(),
          score: user.score || 0
        });
      }
    });

    users.sort((a, b) => b.score - a.score);

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
  
  element.querySelector('.retry-button').addEventListener('click', loadLeaderboard);
}

// ==================== UI Functions ====================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
  });
  
  const pageElement = document.getElementById(`${pageId}-page`);
  if (pageElement) {
    pageElement.style.display = "block";
    
    if (pageId === 'leaders') loadLeaderboard();
    if (pageId === 'shop') updateGemDisplay();
  }
  
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

// Utility Functions
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
    alert('Копирование запрещено');
  });
  
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'v', 'V', 'a', 'A', 'x', 'X'].includes(e.key)) {
      e.preventDefault();
      alert('Копирование запрещено');
    }
  });
}

function startOneVsOne() {
  showPage('one-vs-one');
  document.getElementById("status").textContent = "Поиск соперника...";
  setTimeout(() => {
    document.getElementById("status").textContent = "Соперник не найден. Попробуйте позже.";
  }, 5000);
}