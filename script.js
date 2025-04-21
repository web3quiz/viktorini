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

// Get database reference
const database = firebase.database();

// App variables
let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let questions = [];
let userData = null;
let userId = "guest_" + Math.random().toString(36).substr(2, 9); // Инициализируем сразу
let referralCount = parseInt(localStorage.getItem("referralCount")) || 0;
let currentCategory = '';
let userProgress = JSON.parse(localStorage.getItem("userProgress")) || {
    quran: { answered: 0, total: 0, lastQuestion: 0 },
    hadisy: { answered: 0, total: 0, lastQuestion: 0 },
    spodvijniki: { answered: 0, total: 0, lastQuestion: 0 },
    history: { answered: 0, total: 0, lastQuestion: 0 }
};

let questionsByCategory = {
    quran: [],
    hadisy: [],
    history: [],
    spodvijniki: [],
    all: []
};

// Backup questions
const backupQuestions = {
    quran: [
        {
            question: "Сколько сур в Коране?",
            answers: ["114", "113", "115", "112"],
            correctAnswer: 0
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
    ],
    spodvijniki: []
};

// Improved Firebase questions loading
async function loadQuestionsFromFirebase() {
    try {
        console.log("Loading questions from Firebase...");
        
        const snapshot = await database.ref('questions').once('value');

        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Questions data received:", data);
            
            // Process each category
            const processCategory = (category) => {
                if (!data[category] || !Array.isArray(data[category])) {
                    console.warn(`Invalid data for category ${category}, using backup`);
                    return backupQuestions[category] || [];
                }
                
                const validQuestions = data[category].filter(q => 
                    q && q.question && q.answers && 
                    Array.isArray(q.answers) && q.answers.length >= 2 &&
                    typeof q.correctAnswer === 'number'
                );
                
                return validQuestions.length > 0 ? validQuestions : (backupQuestions[category] || []);
            };

            questionsByCategory = {
                quran: processCategory('quran'),
                hadisy: processCategory('hadisy'),
                history: processCategory('history'),
                spodvijniki: processCategory('spodvijniki'),
                all: []
            };

            // Update totals and combine all questions
            Object.keys(questionsByCategory).forEach(category => {
                if (category !== 'all') {
                    userProgress[category].total = questionsByCategory[category].length;
                }
            });

            questionsByCategory.all = [
                ...questionsByCategory.quran,
                ...questionsByCategory.hadisy,
                ...questionsByCategory.history,
                ...questionsByCategory.spodvijniki
            ];

            saveProgress();
            console.log("Questions loaded successfully:", questionsByCategory);
            return true;
        } else {
            console.log("No data in Firebase, using backup questions");
            useBackupQuestions();
            return false;
        }
    } catch (error) {
        console.error("Error loading questions:", error);
        useBackupQuestions();
        return false;
    }
}

function useBackupQuestions() {
    console.log("Using backup questions");
    questionsByCategory = {
        quran: [...backupQuestions.quran],
        hadisy: [...backupQuestions.hadisy],
        history: [...backupQuestions.history],
        spodvijniki: [...backupQuestions.spodvijniki],
        all: [
            ...backupQuestions.quran,
            ...backupQuestions.hadisy,
            ...backupQuestions.history,
            ...backupQuestions.spodvijniki
        ]
    };

    // Update progress totals
    userProgress.quran.total = questionsByCategory.quran.length;
    userProgress.hadisy.total = questionsByCategory.hadisy.length;
    userProgress.history.total = questionsByCategory.history.length;
    userProgress.spodvijniki.total = questionsByCategory.spodvijniki.length;

    saveProgress();
}

// Initialize app
async function initializeApp() {
    try {
        document.getElementById('loader').style.display = 'flex';
        initTelegramWebApp();
        
        // Initialize user ID before loading questions
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            userData = Telegram.WebApp.initDataUnsafe.user;
            userId = userData.id.toString();
        }
        
        // Load questions with retry logic
        let loaded = false;
        for (let i = 0; i < 3; i++) {
            loaded = await loadQuestionsFromFirebase();
            if (loaded) break;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!loaded) {
            console.log("Using backup questions after retries");
        }

        await initUserData();
        updateProfile();
        updateReferralStats();
        checkReferral();
        updateProgressBars();
        
        document.getElementById('loader').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        showPage('home');
        setupCopyProtection();

    } catch (error) {
        console.error("App initialization failed:", error);
        document.getElementById('loader').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        alert("Приложение загружено с ограниченным функционалом. Некоторые вопросы могут быть недоступны.");
        showPage('home');
    }
}

// [Остальные функции остаются без изменений...]



// USER DATA FUNCTIONS
async function initUserData() {
    score = parseInt(localStorage.getItem("quizScore")) || 0;
    referralCount = parseInt(localStorage.getItem("referralCount")) || 0;

    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        userData = Telegram.WebApp.initDataUnsafe.user;
        userId = userData.id.toString();
        
        try {
            const userRef = database.ref('users/' + userId);
            const snapshot = await userRef.once('value');
            
            if (!snapshot.exists()) {
                await userRef.set({
                    id: userId,
                    firstName: userData.first_name,
                    lastName: userData.last_name || '',
                    username: userData.username || '',
                    score: score,
                    referrals: referralCount,
                    progress: userProgress,
                    lastActive: firebase.database.ServerValue.TIMESTAMP,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            } else {
                const user = snapshot.val();
                score = user.score || score;
                referralCount = user.referrals || referralCount;
                
                if (user.progress) {
                    userProgress = user.progress;
                    localStorage.setItem("userProgress", JSON.stringify(userProgress));
                }
                
                localStorage.setItem("quizScore", score);
                localStorage.setItem("referralCount", referralCount);
                
                await userRef.update({ 
                    lastActive: firebase.database.ServerValue.TIMESTAMP,
                    score: score,
                    referrals: referralCount
                });
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

async function updateUserData(updates) {
    try {
        if (!userId.startsWith("guest_")) {
            await database.ref('users/' + userId).update({
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

// QUIZ FUNCTIONS
function startQuiz(category) {
    if (!questionsByCategory[category] || questionsByCategory[category].length === 0) {
        alert("Вопросы для этой категории временно недоступны. Попробуйте позже.");
        return;
    }
    
    currentCategory = category;
    questions = [...questionsByCategory[category]];
    currentQuestionIndex = userProgress[category].lastQuestion || 0;
    
    if (currentQuestionIndex >= questions.length) {
        currentQuestionIndex = 0;
        userProgress[category].lastQuestion = 0;
        saveProgress();
    }
    
    showPage('quiz');
    updateQuizProgress();
    loadQuestion();
}

function updateQuizProgress() {
    document.getElementById('currentQuestionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
    document.getElementById('quizProgress').style.width = `${progressPercent}%`;
}

function loadQuestion() {
    updateQuizProgress();
    
    const questionElement = document.getElementById("question");
    const answersContainer = document.getElementById("answers");
    const nextButton = document.getElementById("nextQuestion");
    
    questionElement.textContent = "";
    answersContainer.innerHTML = "";
    nextButton.disabled = true;
    
    const questionData = questions[currentQuestionIndex];
    questionElement.textContent = questionData.question;
    
    questionData.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.className = "answer-button";
        button.textContent = answer;
        button.onclick = () => checkAnswer(index);
        answersContainer.appendChild(button);
    });
}

function checkAnswer(index) {
    const questionData = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll(".answer-button");
    
    buttons.forEach(btn => btn.disabled = true);
    document.getElementById("nextQuestion").disabled = false;
    
    if (index === questionData.correctAnswer) {
        buttons[index].classList.add("correct");
        
        if (currentQuestionIndex >= userProgress[currentCategory].answered) {
            userProgress[currentCategory].answered++;
            score += 5;
            updateGemDisplay();
        }
    } else {
        buttons[index].classList.add("incorrect");
        buttons[questionData.correctAnswer].classList.add("correct");
    }
    
    userProgress[currentCategory].lastQuestion = currentQuestionIndex;
    saveProgress();
}

function loadNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= questions.length) {
        alert("Вы завершили эту викторину!");
        showPage('categories');
        return;
    }
    
    loadQuestion();
}

// PROGRESS FUNCTIONS
function saveProgress() {
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
    updateProgressBars();
    
    if (!userId.startsWith("guest_")) {
        database.ref(`users/${userId}/progress`).set(userProgress);
    }
}

function updateProgressBars() {
    updateCategoryProgress('quran');
    updateCategoryProgress('hadisy');
    updateCategoryProgress('spodvijniki');
    updateCategoryProgress('history');
    
    const totalAnswered = Object.values(userProgress).reduce((sum, cat) => sum + cat.answered, 0);
    const totalQuestions = Object.values(userProgress).reduce((sum, cat) => sum + cat.total, 0);
    const totalProgress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
    
    document.getElementById('totalProgress').style.width = `${totalProgress}%`;
    document.getElementById('totalProgressText').textContent = `${totalProgress}%`;
}

function updateCategoryProgress(category) {
    const progress = userProgress[category];
    const progressPercent = progress.total > 0 ? Math.round((progress.answered / progress.total) * 100) : 0;
    
    document.getElementById(`${category}Progress`).style.width = `${progressPercent}%`;
    document.getElementById(`${category}ProgressText`).textContent = `${progressPercent}%`;
}

// UI FUNCTIONS
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

// OTHER FUNCTIONS
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
    const modalUserName = document.getElementById("modalUserName");
    const modalUserId = document.getElementById("modalUserId");
    
    if (userData) {
        const fullName = `${userData.first_name} ${userData.last_name || ''}`.trim();
        profileName.textContent = fullName;
        modalUserName.textContent = fullName;
        modalUserId.textContent = userData.id || "Не определен";
    } else {
        profileName.textContent = "Гость";
        modalUserName.textContent = "Гость";
        modalUserId.textContent = "Гостевой режим";
    }
}

function updateGemDisplay() {
    document.getElementById("profileGemCount").textContent = score;
    document.getElementById("gemBalance").textContent = score;
    document.getElementById("modalUserGem").textContent = score;
    localStorage.setItem("quizScore", score);
    
    if (!userId.startsWith("guest_")) {
        updateUserData({ score: score });
    }
}

// REFERRAL SYSTEM
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
                database.ref('users/' + refUserId).transaction(user => {
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

// LEADERBOARD FUNCTIONS
async function loadLeaderboard() {
    const leaderboardElement = document.getElementById("leaderboard");
    
    try {
        leaderboardElement.innerHTML = `
            <li class="loading">
                <div class="loading-spinner"></div>
                <span>Загрузка рейтинга...</span>
            </li>
        `;

        const snapshot = await database.ref('users')
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
            <span>Пока никто не участвовал</span>
        </li>
    `;
}

function showErrorMessage(element) {
    element.innerHTML = `
        <li class="error">
            <div>
                <span>Ошибка загрузки</span>
                <button class="retry-button" onclick="loadLeaderboard()">Повторить</button>
            </div>
        </li>
    `;
}

// SHOP FUNCTIONS
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
            await database.ref(`users/${userId}/purchases`).push({
                item: itemName,
                price: price,
                date: firebase.database.ServerValue.TIMESTAMP
            });
        }
    } catch (error) {
        console.error("Save purchase error:", error);
    }
}

// UTILITY FUNCTIONS
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

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);