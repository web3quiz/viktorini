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
    roomRef: null,
    isHost: false,
    isReady: false,
    gameStarted: false,
    currentQuestionIndex: 0,
    playerAnswers: {},
    scores: {},
    timer: null,
    listeners: []
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
        checkRoomLink(); // Check for room link
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
    
    // Всегда перемешиваем вопросы при начале викторины
    shuffledQuestions = shuffleArray([...questionsByCategory[category]]);
    currentQuestionIndex = 0;
    
    showPage('quiz');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= shuffledQuestions.length) {
        currentQuestionIndex = 0;
        shuffledQuestions = shuffleArray([...shuffledQuestions]); // Перемешиваем заново если дошли до конца
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
    loadQuestion();
}


// ==================== Multiplayer Functions ====================

function startMultiplayer() {
    // Cleanup previous state
    cleanupMultiplayer();
    
    showPage('multiplayer');
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    // Generate room ID
    multiplayerState.roomId = generateRoomId();
    multiplayerState.isHost = true;
    
    // Create room in Firebase
    createRoom();
}

function joinMultiplayer(roomId) {
    // Cleanup previous state
    cleanupMultiplayer();
    
    showPage('multiplayer');
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    multiplayerState.roomId = roomId;
    multiplayerState.isHost = false;
    
    // Join existing room
    joinRoom();
}

function generateRoomId() {
    return 'room_' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function createRoom() {
    multiplayerState.roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
    
    // Set initial room data
    multiplayerState.roomRef.set({
        status: 'waiting',
        players: {},
        currentQuestion: 0,
        questions: [],
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        // Add current player
        addPlayerToRoom();
        setupRoomListeners();
        updateStatus("Ожидание игроков...");
        document.getElementById('roomIdDisplay').textContent = multiplayerState.roomId;
    }).catch(error => {
        console.error("Error creating room:", error);
        updateStatus("Ошибка создания комнаты");
    });
}

function joinRoom() {
    multiplayerState.roomRef = firebase.database().ref('rooms/' + multiplayerState.roomId);
    
    // Check if room exists
    multiplayerState.roomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            updateStatus("Комната не найдена");
            return;
        }
        
        const room = snapshot.val();
        if (room.status !== 'waiting') {
            updateStatus("Игра уже началась");
            return;
        }
        
        if (Object.keys(room.players).length >= 5) {
            updateStatus("Комната заполнена");
            return;
        }
        
        // Add player to room
        addPlayerToRoom();
        setupRoomListeners();
        document.getElementById('roomIdDisplay').textContent = multiplayerState.roomId;
    }).catch(error => {
        console.error("Error joining room:", error);
        updateStatus("Ошибка входа в комнату");
    });
}

function addPlayerToRoom() {
    const playerData = {
        id: userId,
        name: userData ? `${userData.first_name} ${userData.last_name || ''}`.trim() : "Гость",
        avatar: userData?.photo_url || "icons/avatar.svg",
        isReady: false,
        score: 0,
        lastActive: firebase.database.ServerValue.TIMESTAMP
    };
    
    multiplayerState.roomRef.child('players/' + userId).set(playerData);
}

function setupRoomListeners() {
    // Room data listener
    const roomListener = multiplayerState.roomRef.on('value', snapshot => {
        const room = snapshot.val();
        if (!room) {
            updateStatus("Комната была закрыта");
            setTimeout(() => {
                showPage('home');
            }, 2000);
            return;
        }
        
        // Update players list
        updatePlayersList(room.players);
        
        // Check if game should start
        if (room.status === 'starting' && !multiplayerState.gameStarted) {
            startGame(room);
        }
        
        // Handle game progress
        if (room.status === 'in_progress' && multiplayerState.gameStarted) {
            handleGameProgress(room);
        }
        
        // Handle game end
        if (room.status === 'finished' && multiplayerState.gameStarted) {
            showResults(room.results);
        }
    });
    
    // Player left listener
    const playerLeftListener = multiplayerState.roomRef.child('players').on('child_removed', snapshot => {
        const playerId = snapshot.key;
        if (playerId === userId) return;
        
        // Update UI
        const playerElement = document.getElementById(`player-${playerId}`);
        if (playerElement) {
            playerElement.remove();
        }
        
        // Update count
        const playersCount = document.querySelectorAll('.player-card').length;
        document.getElementById('playersCount').textContent = playersCount;
    });
    
    // Store listeners for cleanup
    multiplayerState.listeners.push(
        { ref: multiplayerState.roomRef, eventType: 'value', callback: roomListener },
        { ref: multiplayerState.roomRef.child('players'), eventType: 'child_removed', callback: playerLeftListener }
    );
}

function updatePlayersList(players) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    
    let readyCount = 0;
    let totalPlayers = 0;
    
    Object.values(players).forEach(player => {
        totalPlayers++;
        if (player.isReady) readyCount++;
        
        const playerElement = document.createElement('div');
        playerElement.className = 'player-card';
        playerElement.id = `player-${player.id}`;
        playerElement.innerHTML = `
            <div class="player-avatar">
                ${player.name.charAt(0).toUpperCase()}
            </div>
            <div class="player-name">${player.name}</div>
            <div class="player-status">${player.isReady ? '✓ Готов' : 'Не готов'}</div>
        `;
        playersList.appendChild(playerElement);
    });
    
    document.getElementById('playersCount').textContent = totalPlayers;
    
    // Auto-start if conditions met (host only)
    if (multiplayerState.isHost && totalPlayers >= 2 && readyCount === totalPlayers) {
        prepareGame();
    }
}

function toggleReady() {
    const newReadyState = !multiplayerState.isReady;
    multiplayerState.isReady = newReadyState;
    
    multiplayerState.roomRef.child(`players/${userId}/isReady`).set(newReadyState);
    document.getElementById('readyButton').classList.toggle('ready', newReadyState);
    document.getElementById('readyButton').textContent = newReadyState ? 'Отменить' : 'Готов';
}

function prepareGame() {
    if (!multiplayerState.isHost) return;
    
    // Select 20 random questions
    const allQuestions = [...questionsByCategory.all];
    const selectedQuestions = shuffleArray(allQuestions).slice(0, 20);
    
    // Update room status and questions
    multiplayerState.roomRef.update({
        status: 'starting',
        questions: selectedQuestions
    });
}

function startGame(room) {
    multiplayerState.gameStarted = true;
    multiplayerState.currentQuestionIndex = 0;
    multiplayerState.scores = {};
    
    // Initialize scores
    Object.keys(room.players).forEach(playerId => {
        multiplayerState.scores[playerId] = 0;
    });
    
    // Update UI
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    
    // Start first question
    loadMultiplayerQuestion(room.questions[0]);
    
    // Update room status
    if (multiplayerState.isHost) {
        multiplayerState.roomRef.update({
            status: 'in_progress',
            currentQuestion: 0,
            startedAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

function loadMultiplayerQuestion(questionData) {
    const questionElement = document.getElementById('mp-question');
    const answersContainer = document.getElementById('mp-answers');
    
    // Clear previous question
    questionElement.textContent = '';
    answersContainer.innerHTML = '';
    
    // Set new question
    questionElement.textContent = questionData.question;
    
    // Add answers
    questionData.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.textContent = answer;
        button.onclick = () => submitAnswer(index, questionData.correctAnswer);
        answersContainer.appendChild(button);
    });
    
    // Start timer
    startQuestionTimer();
}

function startQuestionTimer() {
    let timeLeft = 20;
    const timerElement = document.getElementById('mp-timer');
    timerElement.textContent = timeLeft;
    
    clearInterval(multiplayerState.timer);
    multiplayerState.timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(multiplayerState.timer);
            proceedToNextQuestion();
        }
    }, 1000);
}

function submitAnswer(answerIndex, correctAnswer) {
    // Disable all buttons
    const buttons = document.querySelectorAll('#mp-answers .answer-button');
    buttons.forEach(btn => btn.disabled = true);
    
    // Mark correct/incorrect
    if (answerIndex === correctAnswer) {
        buttons[answerIndex].classList.add('correct');
        
        // Update score locally
        multiplayerState.scores[userId] = (multiplayerState.scores[userId] || 0) + 1;
        
        // Update score in Firebase
        multiplayerState.roomRef.child(`players/${userId}/score`).transaction(score => {
            return (score || 0) + 1;
        });
    } else {
        buttons[answerIndex].classList.add('incorrect');
        buttons[correctAnswer].classList.add('correct');
    }
    
    // Save answer
    multiplayerState.playerAnswers[multiplayerState.currentQuestionIndex] = answerIndex;
}

function proceedToNextQuestion() {
    if (!multiplayerState.isHost) return;
    
    multiplayerState.currentQuestionIndex++;
    
    multiplayerState.roomRef.once('value').then(snapshot => {
        const room = snapshot.val();
        const questions = room.questions || [];
        
        if (multiplayerState.currentQuestionIndex < questions.length) {
            // Load next question
            multiplayerState.roomRef.update({
                currentQuestion: multiplayerState.currentQuestionIndex
            });
        } else {
            // End game
            endGame();
        }
    });
}

function handleGameProgress(room) {
    if (room.currentQuestion !== multiplayerState.currentQuestionIndex) {
        multiplayerState.currentQuestionIndex = room.currentQuestion;
        
        if (multiplayerState.currentQuestionIndex < room.questions.length) {
            loadMultiplayerQuestion(room.questions[room.currentQuestionIndex]);
        }
    }
}

function endGame() {
    if (!multiplayerState.isHost) return;
    
    // Calculate results
    multiplayerState.roomRef.child('players').once('value').then(snapshot => {
        const players = snapshot.val();
        const results = [];
        
        // Prepare results array
        Object.keys(players).forEach(playerId => {
            results.push({
                id: playerId,
                name: players[playerId].name,
                score: players[playerId].score || 0
            });
        });
        
        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        // Award GEM to top players
        if (results.length > 0 && !results[0].id.startsWith("guest_")) {
            firebase.database().ref(`users/${results[0].id}/score`).transaction(score => {
                return (score || 0) + 50; // 50 GEM for 1st place
            });
        }
        if (results.length > 1 && !results[1].id.startsWith("guest_")) {
            firebase.database().ref(`users/${results[1].id}/score`).transaction(score => {
                return (score || 0) + 30; // 30 GEM for 2nd place
            });
        }
        if (results.length > 2 && !results[2].id.startsWith("guest_")) {
            firebase.database().ref(`users/${results[2].id}/score`).transaction(score => {
                return (score || 0) + 20; // 20 GEM for 3rd place
            });
        }
        
        // Update room with results
        multiplayerState.roomRef.update({
            status: 'finished',
            results: results,
            finishedAt: firebase.database.ServerValue.TIMESTAMP
        });
    });
}

function showResults(results) {
    multiplayerState.gameStarted = false;
    
    document.getElementById('game').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '';
    
    // Sort results by score
    const sortedResults = Object.values(results).sort((a, b) => b.score - a.score);
    
    // Display results
    sortedResults.forEach((player, index) => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        
        let prize = '';
        if (index === 0) prize = ' (+50 GEM)';
        else if (index === 1) prize = ' (+30 GEM)';
        else if (index === 2) prize = ' (+20 GEM)';
        
        resultElement.innerHTML = `
            <div class="result-position">${index + 1}</div>
            <div class="result-name">${player.name}</div>
            <div class="result-score">${player.score} ${prize}</div>
        `;
        
        scoreboard.appendChild(resultElement);
    });
}

function leaveMultiplayerRoom() {
    if (!multiplayerState.roomRef) return;
    
    // Remove player from room
    multiplayerState.roomRef.child(`players/${userId}`).remove().catch(error => {
        console.error("Error removing player:", error);
    });
    
    // If host and room is empty, delete room
    if (multiplayerState.isHost) {
        multiplayerState.roomRef.child('players').once('value').then(snapshot => {
            if (!snapshot.exists() || snapshot.numChildren() === 0) {
                multiplayerState.roomRef.remove();
            }
        });
    }
    
    cleanupMultiplayer();
}

function cleanupMultiplayer() {
    // Clear timer
    clearInterval(multiplayerState.timer);
    
    // Remove all listeners
    multiplayerState.listeners.forEach(listener => {
        if (listener.ref && listener.eventType && listener.callback) {
            listener.ref.off(listener.eventType, listener.callback);
        }
    });
    multiplayerState.listeners = [];
    
    // Reset state
    multiplayerState = {
        roomId: null,
        roomRef: null,
        isHost: false,
        isReady: false,
        gameStarted: false,
        currentQuestionIndex: 0,
        playerAnswers: {},
        scores: {},
        timer: null,
        listeners: []
    };
}

function copyRoomLink() {
    const link = `${window.location.origin}${window.location.pathname}?room=${multiplayerState.roomId}`;
    navigator.clipboard.writeText(link).then(() => {
        if (window.Telegram?.WebApp) {
            Telegram.WebApp.showAlert('Ссылка скопирована');
        } else {
            alert('Ссылка скопирована');
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Handle room link on page load
function checkRoomLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId) {
        joinMultiplayer(roomId);
    }
}

// ==================== User Functions ====================

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

function shareReferralLink() {
    const referralLink = generateReferralLink();
    
    // Для Telegram WebApp (встроенный браузер Telegram)
    if (window.Telegram?.WebApp?.openTelegramLink) {
        try {
            Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`);
            return;
        } catch (e) {
            console.error("Error opening Telegram:", e);
        }
    }
    
    // Для мобильных устройств (Android/iOS)
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
            if (user?.score !== undefined) {
                users.push({
                    id: childSnapshot.key,
                    name: `${user.firstName || user.first_name || 'Аноним'} ${user.lastName || user.last_name || ''}`.trim(),
                    score: user.score || 0
                });
            }
        });

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
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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

async function updateScore(points) {
    score += points;
    localStorage.setItem("quizScore", score);
    
    if (!userId.startsWith("guest_")) {
        await updateUserData({ score: score });
    }
    
    updateGemDisplay();
}