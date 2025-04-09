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
let currentCategory = '';
let questionsByCategory = {
  quran: [],
  hadisy: [],
  history: [],
  all: []
};

// Multiplayer state
let multiplayerState = {
  roomId: null,
  players: [],
  currentPlayerCount: 0,
  isHost: false,
  gameStarted: false,
  currentQuestionIndex: 0,
  playerAnswers: {},
  scores: {},
  timer: null,
  roomListener: null,
  isLeaving: false // Флаг для отслеживания процесса выхода
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
    console.log("Initializing app...");
    initTelegramWebApp();
    
    firebase.database().ref('.info/connected').on('value', (snap) => {
      console.log(snap.val() ? "Connected to Firebase" : "Not connected to Firebase");
    });

    await loadQuestionsFromFirebase();
    await initUserData();
    updateProfile();
    updateReferralStats();
    checkReferral();
    showPage('home');
    setupCopyProtection();
    
    console.log("App initialized successfully");
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
      const firebaseQuestions = snapshot.val();
      questionsByCategory = {
        quran: [...(firebaseQuestions.quran || []), ...(temporaryQuestions.quran || [])],
        hadisy: [...(firebaseQuestions.hadisy || []), ...(temporaryQuestions.hadisy || [])],
        history: [...(firebaseQuestions.history || []), ...(temporaryQuestions.history || [])],
        all: [
          ...(firebaseQuestions.quran || []),
          ...(firebaseQuestions.hadisy || []),
          ...(firebaseQuestions.history || []),
          ...(temporaryQuestions.quran || []),
          ...(temporaryQuestions.hadisy || []),
          ...(temporaryQuestions.history || [])
        ]
      };
    } else {
      questionsByCategory = temporaryQuestions;
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    questionsByCategory = temporaryQuestions;
  }
}

async function initUserData() {
  score = parseInt(localStorage.getItem("quizScore")) || 0;
  referralCount = parseInt(localStorage.getItem("referralCount")) || 0;

  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    userData = Telegram.WebApp.initDataUnsafe.user;
    userId = userData.id.toString();
    
    try {
      const userRef = firebase.database().ref('users/' + userId);
      const snapshot = await userRef.once('value');
      
      if (!snapshot.exists()) {
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
        const user = snapshot.val();
        score = user.score || score;
        referralCount = user.referrals || referralCount;
        localStorage.setItem("quizScore", score);
        localStorage.setItem("referralCount", referralCount);
        await userRef.update({ lastActive: firebase.database.ServerValue.TIMESTAMP });
      }
    } catch (error) {
      console.error("User init error:", error);
      userId = "guest_" + Math.random().toString(36).substr(2, 9);
    }
  } else {
    userId = "guest_" + Math.random().toString(36).substr(2, 9);
  }
  updateGemDisplay();
}

// ==================== Multiplayer Functions ====================

function startMultiplayer() {
  // Если уже в процессе выхода - не разрешаем новое подключение
  if (multiplayerState.isLeaving) {
    alert("Пожалуйста, подождите, завершается предыдущая сессия");
    return;
  }

  // Если уже в комнате - выходим перед новым подключением
  if (multiplayerState.roomId) {
    leaveRoom(() => {
      // После выхода запускаем новое подключение
      resetMultiplayerState();
      startMultiplayer();
    });
    return;
  }

  showPage('multiplayer');
  updateStatus("Поиск доступной комнаты...");

  const roomRef = firebase.database().ref('rooms').orderByChild('playerCount').endAt(4).limitToFirst(1);
  
  roomRef.once('value').then(snapshot => {
    if (snapshot.exists()) {
      const roomData = snapshot.val();
      const roomId = Object.keys(roomData)[0];
      joinRoom(roomId);
    } else {
      createRoom();
    }
  }).catch(error => {
    console.error("Error finding room:", error);
    createRoom();
  });
}

function resetMultiplayerState() {
  multiplayerState = {
    roomId: null,
    players: [],
    currentPlayerCount: 0,
    isHost: false,
    gameStarted: false,
    currentQuestionIndex: 0,
    playerAnswers: {},
    scores: {},
    timer: null,
    roomListener: null,
    isLeaving: false
  };
}

function createRoom() {
  const roomId = 'room_' + Math.random().toString(36).substr(2, 9);
  const roomRef = firebase.database().ref('rooms/' + roomId);
  
  const playerData = {
    id: userId,
    name: userData ? `${userData.first_name} ${userData.last_name || ''}`.trim() : "Гость",
    score: 0,
    isReady: true,
    isHost: true,
    joinedAt: firebase.database.ServerValue.TIMESTAMP
  };

  roomRef.set({
    playerCount: 1,
    players: { [userId]: playerData },
    status: 'waiting',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    multiplayerState.roomId = roomId;
    multiplayerState.isHost = true;
    setupRoomListeners(roomId);
    updateStatus("Вы создали комнату. Ожидание игроков... (1/2)");
  }).catch(error => {
    console.error("Error creating room:", error);
    updateStatus("Ошибка создания комнаты");
  });
}

function joinRoom(roomId) {
  const roomRef = firebase.database().ref('rooms/' + roomId);
  
  roomRef.transaction(currentRoom => {
    if (!currentRoom) return null;
    
    if (!currentRoom.players) currentRoom.players = {};
    if (!currentRoom.players[userId]) {
      currentRoom.playerCount = (currentRoom.playerCount || 0) + 1;
      currentRoom.players[userId] = {
        id: userId,
        name: userData ? `${userData.first_name} ${userData.last_name || ''}`.trim() : "Гость",
        score: 0,
        isReady: true,
        isHost: false,
        joinedAt: firebase.database.ServerValue.TIMESTAMP
      };
    }
    return currentRoom;
  }, (error, committed) => {
    if (error) {
      console.error("Join room error:", error);
      updateStatus("Ошибка входа в комнату");
      resetMultiplayerState();
    } else if (committed) {
      multiplayerState.roomId = roomId;
      setupRoomListeners(roomId);
      updateStatus("Вы присоединились к комнате. Ожидание игроков...");
    }
  });
}

function setupRoomListeners(roomId) {
  // Удаляем предыдущий слушатель, если он был
  if (multiplayerState.roomListener) {
    firebase.database().ref('rooms/' + multiplayerState.roomId).off('value', multiplayerState.roomListener);
  }

  const roomRef = firebase.database().ref('rooms/' + roomId);
  
  multiplayerState.roomListener = roomRef.on('value', snapshot => {
    const roomData = snapshot.val();
    if (!roomData) {
      updateStatus("Комната была удалена");
      setTimeout(() => {
        showPage('home');
        resetMultiplayerState();
      }, 2000);
      return;
    }

    // Обновляем состояние
    multiplayerState.currentPlayerCount = roomData.playerCount || 0;
    multiplayerState.players = roomData.players ? Object.values(roomData.players) : [];
    
    // Проверка рассинхронизации
    if (roomData.players && roomData.playerCount !== Object.keys(roomData.players).length) {
      console.warn("Player count mismatch, correcting...");
      if (multiplayerState.isHost) {
        roomRef.update({ playerCount: Object.keys(roomData.players).length });
      }
    }

    updatePlayerList(multiplayerState.players);
    updateStatus(`Игроков: ${multiplayerState.currentPlayerCount}/2`);

    // Автозапуск игры при 5 игроках
    if (multiplayerState.currentPlayerCount >= 2 && roomData.status === 'waiting') {
      if (multiplayerState.isHost) {
        startMultiplayerGame();
      } else {
        updateStatus("Ожидаем начала игры от создателя...");
      }
    }

    // Обработка начала игры
    if (roomData.status === 'in_progress' && !multiplayerState.gameStarted) {
      multiplayerState.gameStarted = true;
      document.getElementById('lobby').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      loadMultiplayerQuestion(roomData.currentQuestion || 0);
    }

    // Обработка завершения игры
    if (roomData.status === 'finished') {
      showMultiplayerResults(roomData.results || []);
    }
  });
}

function leaveRoom(callback) {
  if (!multiplayerState.roomId || multiplayerState.isLeaving) {
    if (callback) callback();
    return;
  }

  multiplayerState.isLeaving = true; // Устанавливаем флаг выхода
  const roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
  
  roomRef.transaction(currentRoom => {
    if (!currentRoom) return null;
    
    if (currentRoom.players && currentRoom.players[userId]) {
      currentRoom.playerCount--;
      delete currentRoom.players[userId];
      
      // Если комната пуста - удаляем
      if (currentRoom.playerCount <= 0) {
        return null;
      }
      
      // Если вышел хост - назначаем нового
      if (currentRoom.players[userId]?.isHost) {
        const newHost = Object.keys(currentRoom.players)[0];
        if (newHost) {
          currentRoom.players[newHost].isHost = true;
        }
      }
    }
    return currentRoom;
  }, (error, committed) => {
    cleanUpRoom();
    if (callback) callback();
  });
}

function cleanUpRoom() {
  if (multiplayerState.roomListener) {
    firebase.database().ref('rooms/' + multiplayerState.roomId).off('value', multiplayerState.roomListener);
  }
  
  if (multiplayerState.timer) {
    clearInterval(multiplayerState.timer);
  }
  
  resetMultiplayerState();
}

// ==================== User Functions ====================

async function updateScore(points) {
  if (!multiplayerState.gameStarted) return;
  
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
    console.log("Telegram WebApp initialized");
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    userData = Telegram.WebApp.initDataUnsafe.user;
  } else {
    console.log("Telegram WebApp not available");
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
  if (!userId) {
    console.error("User ID not available");
    return 'https://t.me/web3quiz_bot';
  }
  const link = `https://t.me/web3quiz_bot?start=ref_${userId}`;
  console.log("Generated referral link:", link);
  return link;
}

// ==================== REFERRAL SHARE FUNCTION ====================

function shareReferralLink() {
  const referralLink = generateReferralLink();
  
  if (window.Telegram?.WebApp?.openTelegramLink) {
    try {
      Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`);
      return;
    } catch (e) {
      console.error("Error opening Telegram:", e);
    }
  }
  
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const appLink = `tg://msg_url?url=${encodeURIComponent(referralLink)}`;
    const webLink = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = appLink;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
      if (!document.hidden) {
        window.open(webLink, '_blank');
      }
    }, 300);
    return;
  }

  window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, '_blank');
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

function subscribeTelegram() {
  window.open("https://t.me/islamskie_viktorini", "_blank");
}

window.addEventListener('beforeunload', () => {
  if (multiplayerState.roomId) {
    leaveRoom();
  }
});