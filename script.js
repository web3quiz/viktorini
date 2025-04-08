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
    timer: null
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
    
    // Test connection
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
    console.log("Loading questions from Firebase...");
    const snapshot = await firebase.database().ref('questions').once('value');
    
    if (snapshot.exists()) {
      console.log("Questions loaded from Firebase:", snapshot.val());
      const firebaseQuestions = snapshot.val();
      
      // Merge Firebase questions with temporary questions
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
      console.log("No questions in Firebase, using temporary questions");
      questionsByCategory = {
        ...temporaryQuestions,
        all: [
          ...(temporaryQuestions.quran || []),
          ...(temporaryQuestions.hadisy || []),
          ...(temporaryQuestions.history || [])
        ]
      };
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    questionsByCategory = {
      ...temporaryQuestions,
      all: [
        ...(temporaryQuestions.quran || []),
        ...(temporaryQuestions.hadisy || []),
        ...(temporaryQuestions.history || [])
      ]
    };
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
  
  // Сохраняем текущую категорию
  currentCategory = category;
  
  // Если категория изменилась, сбрасываем индекс
  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory !== category) {
    currentQuestionIndex = 0;
    localStorage.removeItem(`lastQuestionIndex_${lastCategory}`);
  }
  
  // Загружаем сохраненный индекс для текущей категории
  const savedIndex = parseInt(localStorage.getItem(`lastQuestionIndex_${category}`)) || 0;
  
  shuffledQuestions = [...questionsByCategory[category]];
  currentQuestionIndex = savedIndex >= shuffledQuestions.length ? 0 : savedIndex;
  
  // Сохраняем текущую категорию
  localStorage.setItem("lastCategory", category);
  
  showPage('quiz');
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length) {
    currentQuestionIndex = 0;
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
  
  // Сохраняем текущий индекс вопроса для категории
  localStorage.setItem(`lastQuestionIndex_${currentCategory}`, currentQuestionIndex);
  
  // Если дошли до конца, начинаем сначала
  if (currentQuestionIndex >= shuffledQuestions.length) {
    currentQuestionIndex = 0;
    localStorage.setItem(`lastQuestionIndex_${currentCategory}`, 0);
  }
  
  loadQuestion();
}

// ==================== Multiplayer Functions ====================

function startMultiplayer() {
    showPage('multiplayer');
    multiplayerState = {
        roomId: null,
        players: [],
        currentPlayerCount: 0,
        isHost: false,
        gameStarted: false,
        currentQuestionIndex: 0,
        playerAnswers: {},
        scores: {},
        timer: null
    };
    
    // Создаем или присоединяемся к комнате
    const roomRef = firebase.database().ref('rooms').orderByChild('playerCount').endAt(4).limitToFirst(1);
    
    roomRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            // Присоединяемся к существующей комнате
            const roomData = snapshot.val();
            const roomId = Object.keys(roomData)[0];
            multiplayerState.roomId = roomId;
            joinRoom(roomId);
        } else {
            // Создаем новую комнату
            multiplayerState.roomId = 'room_' + Math.random().toString(36).substr(2, 9);
            multiplayerState.isHost = true;
            createRoom(multiplayerState.roomId);
        }
    });
    
    updateStatus("Поиск комнаты...");
}

function createRoom(roomId) {
    const roomRef = firebase.database().ref('rooms/' + roomId);
    const playerData = {
        id: userId,
        name: userData ? `${userData.first_name} ${userData.last_name || ''}`.trim() : "Гость",
        score: 0,
        isReady: true
    };
    
    roomRef.set({
        playerCount: 1,
        players: { [userId]: playerData },
        status: 'waiting',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Начинаем слушать изменения в комнате
    setupRoomListeners(roomId);
    updateStatus("Комната создана. Ожидание игроков... (1/5)");
}

function joinRoom(roomId) {
    const roomRef = firebase.database().ref('rooms/' + roomId);
    const playerRef = roomRef.child('players/' + userId);
    
    playerRef.set({
        id: userId,
        name: userData ? `${userData.first_name} ${userData.last_name || ''}`.trim() : "Гость",
        score: 0,
        isReady: true
    });
    
    // Обновляем счетчик игроков
    roomRef.child('playerCount').transaction(count => (count || 0) + 1);
    
    // Начинаем слушать изменения в комнате
    setupRoomListeners(roomId);
}

function setupRoomListeners(roomId) {
    const roomRef = firebase.database().ref('rooms/' + roomId);
    
    roomRef.on('value', snapshot => {
        const roomData = snapshot.val();
        if (!roomData) return;
        
        multiplayerState.currentPlayerCount = roomData.playerCount || 0;
        multiplayerState.players = roomData.players ? Object.values(roomData.players) : [];
        
        // Обновляем UI
        updatePlayerList(multiplayerState.players);
        updateStatus(`Ожидание игроков... (${multiplayerState.currentPlayerCount}/5)`);
        
        // Показываем кнопку "Начать игру" только для хоста, когда набралось 5 игроков
        if (multiplayerState.isHost && multiplayerState.currentPlayerCount >= 5 && !multiplayerState.gameStarted) {
            document.getElementById('startGameBtn').style.display = 'block';
        } else {
            document.getElementById('startGameBtn').style.display = 'none';
        }
        
        // Если игра началась, переключаемся на экран игры
        if (roomData.status === 'in_progress' && !multiplayerState.gameStarted) {
            multiplayerState.gameStarted = true;
            startMultiplayerGame();
        }
        
        // Если игра закончилась, показываем результаты
        if (roomData.status === 'finished') {
            showMultiplayerResults(roomData.results);
        }
    });
}

function updatePlayerList(players) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-item';
        playerElement.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-status">${player.isReady ? '✓' : '...'}</span>
        `;
        playersList.appendChild(playerElement);
    });
}

function startMultiplayerGame() {
    if (!multiplayerState.isHost) return;
    
    const roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
    roomRef.update({
        status: 'in_progress',
        currentQuestion: 0,
        questions: getRandomQuestions(20) // Функция для выбора 20 случайных вопросов
    });
    
    // Переключаем UI на экран игры
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    multiplayerState.gameStarted = true;
    
    // Начинаем игру
    loadMultiplayerQuestion(0);
}

function getRandomQuestions(count) {
    const allQuestions = [...questionsByCategory.all];
    const shuffled = shuffleArray(allQuestions);
    return shuffled.slice(0, count);
}

function loadMultiplayerQuestion(index) {
    const roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
    
    roomRef.once('value').then(snapshot => {
        const roomData = snapshot.val();
        if (!roomData || !roomData.questions) return;
        
        const questionData = roomData.questions[index];
        document.getElementById('mp-question').textContent = questionData.question;
        
        // Очищаем предыдущие ответы
        const answersContainer = document.getElementById('mp-answers');
        answersContainer.innerHTML = '';
        
        // Добавляем кнопки ответов
        questionData.answers.forEach((answer, i) => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = answer;
            button.onclick = () => submitMultiplayerAnswer(i);
            answersContainer.appendChild(button);
        });
        
        // Запускаем таймер
        startTimer(30, () => {
            proceedToNextQuestion();
        });
    });
}

function startTimer(seconds, callback) {
    let timeLeft = seconds;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeLeft;
    
    multiplayerState.timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(multiplayerState.timer);
            callback();
        }
    }, 1000);
}

function submitMultiplayerAnswer(answerIndex) {
    const roomRef = firebase.database().ref(`rooms/${multiplayerState.roomId}/answers/${multiplayerState.currentQuestionIndex}/${userId}`);
    roomRef.set({
        answer: answerIndex,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Блокируем кнопки после ответа
    const buttons = document.querySelectorAll('#mp-answers .answer-button');
    buttons.forEach(btn => btn.disabled = true);
}

function proceedToNextQuestion() {
    clearInterval(multiplayerState.timer);
    multiplayerState.currentQuestionIndex++;
    
    const roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
    roomRef.update({
        currentQuestion: multiplayerState.currentQuestionIndex
    });
    
    // Проверяем, не закончились ли вопросы
    roomRef.once('value').then(snapshot => {
        const roomData = snapshot.val();
        if (multiplayerState.currentQuestionIndex >= roomData.questions.length) {
            finishMultiplayerGame();
        } else {
            loadMultiplayerQuestion(multiplayerState.currentQuestionIndex);
        }
    });
}

function finishMultiplayerGame() {
    const roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
    
    // Подсчитываем результаты
    roomRef.once('value').then(snapshot => {
        const roomData = snapshot.val();
        const results = [];
        
        // Подсчет очков для каждого игрока
        Object.entries(roomData.players).forEach(([playerId, playerData]) => {
            let score = 0;
            
            // Проверяем ответы на каждый вопрос
            for (let i = 0; i < roomData.questions.length; i++) {
                const question = roomData.questions[i];
                const playerAnswer = roomData.answers?.[i]?.[playerId]?.answer;
                
                if (playerAnswer !== undefined && playerAnswer === question.correctAnswer) {
                    score += 1;
                }
            }
            
            results.push({
                id: playerId,
                name: playerData.name,
                score: score
            });
        });
        
        // Сортируем по убыванию очков
        results.sort((a, b) => b.score - a.score);
        
        // Награждаем победителей
        if (results.length > 0) {
            // 1 место
            if (!results[0].id.startsWith("guest_")) {
                firebase.database().ref('users/' + results[0].id).transaction(user => {
                    if (user) user.score = (user.score || 0) + 50;
                    return user;
                });
            }
            
            // 2 место
            if (results.length > 1 && !results[1].id.startsWith("guest_")) {
                firebase.database().ref('users/' + results[1].id).transaction(user => {
                    if (user) user.score = (user.score || 0) + 30;
                    return user;
                });
            }
            
            // 3 место
            if (results.length > 2 && !results[2].id.startsWith("guest_")) {
                firebase.database().ref('users/' + results[2].id).transaction(user => {
                    if (user) user.score = (user.score || 0) + 20;
                    return user;
                });
            }
        }
        
        // Обновляем статус комнаты
        roomRef.update({
            status: 'finished',
            results: results
        });
        
        // Показываем результаты
        showMultiplayerResults(results);
    });
}

function showMultiplayerResults(results) {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '<h2>Результаты</h2>';
    
    results.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'result-item';
        
        let prize = '';
        if (index === 0) prize = '🥇 +50 GEM';
        else if (index === 1) prize = '🥈 +30 GEM';
        else if (index === 2) prize = '🥉 +20 GEM';
        
        playerElement.innerHTML = `
            <span class="position">${index + 1}</span>
            <span class="name">${player.name}</span>
            <span class="score">${player.score} очков</span>
            <span class="prize">${prize}</span>
        `;
        scoreboard.appendChild(playerElement);
    });
    
    // Показываем кнопку "Вернуться в меню"
    const backButton = document.createElement('button');
    backButton.className = 'big-button';
    backButton.textContent = 'Вернуться в меню';
    backButton.onclick = () => showPage('home');
    scoreboard.appendChild(backButton);
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// ==================== User Functions ====================

async function updateScore(points) {
    // Убираем начисление очков за обычную викторину
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
    
    // Для Telegram WebApp (встроенный браузер Telegram)
    if (window.Telegram?.WebApp?.openTelegramLink) {
        try {
            // Открываем интерфейс отправки сообщения
            Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`);
            return;
        } catch (e) {
            console.error("Error opening Telegram:", e);
        }
    }
    
    // Для мобильных устройств (Android/iOS)
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Пытаемся открыть в приложении Telegram
        const appLink = `tg://msg_url?url=${encodeURIComponent(referralLink)}`;
        const webLink = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`;
        
        // Создаем скрытый iframe для открытия appLink
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appLink;
        document.body.appendChild(iframe);
        
        // Фолбэк: если приложение не открылось, через 300ms открываем веб-версию
        setTimeout(() => {
            document.body.removeChild(iframe);
            if (!document.hidden) {
                window.open(webLink, '_blank');
            }
        }, 300);
        return;
    }

    // Для десктопной версии
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, '_blank');
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

function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank");
}

// Удалите функцию startOneVsOne, так как она больше не нужна