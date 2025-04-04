// Основные переменные
let currentQuestionIndex = 0;
let score = 0;
let shuffledQuestions = [];
let userData = null;
let userId = null;
let questionsByCategory = {
    quran: [],
    hadisy: [],
    history: [],
    all: []
};

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC6quHrp9tQbLwjUWrupw1C4ljQfPk3uNA",
    authDomain: "myquizapp-786ee.firebaseapp.com",
    databaseURL: "https://myquizapp-786ee-default-rtdb.firebaseio.com",
    projectId: "myquizapp-786ee",
    storageBucket: "myquizapp-786ee.firebasestorage.app",
    messagingSenderId: "351619904262",
    appId: "1:351619904262:web:67133361608fb0e22ce487"
};

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", async () => {
    try {
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
    }
});

// Инициализация данных пользователя
async function initUserData() {
    if (userData) {
        userId = userData.id.toString();
        try {
            const snapshot = await firebase.database().ref('users/' + userId).once('value');
            if (!snapshot.exists()) {
                await saveUserData({
                    id: userId,
                    firstName: userData.first_name,
                    lastName: userData.last_name || '',
                    username: userData.username || '',
                    score: 0,
                    referrals: 0,
                    lastActive: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                });
            } else {
                await updateUserData({ lastActive: new Date().toISOString() });
                score = snapshot.val().score || 0;
            }
        } catch (error) {
            console.error("Ошибка инициализации пользователя:", error);
            userId = "local_" + Math.random().toString(36).substr(2, 9);
            score = parseInt(localStorage.getItem("quizScore")) || 0;
        }
    } else {
        userId = "local_" + Math.random().toString(36).substr(2, 9);
        score = parseInt(localStorage.getItem("quizScore")) || 0;
    }
    updateGemDisplay();
}

// Сохранение данных пользователя
async function saveUserData(data) {
    try {
        await firebase.database().ref('users/' + userId).set(data);
    } catch (error) {
        console.error("Ошибка сохранения данных:", error);
    }
}

// Обновление данных пользователя
async function updateUserData(updates) {
    try {
        await firebase.database().ref('users/' + userId).update(updates);
    } catch (error) {
        console.error("Ошибка обновления данных:", error);
    }
}

// Загрузка вопросов из Firebase
async function loadQuestionsFromFirebase() {
    try {
        const snapshot = await firebase.database().ref('questions').once('value');
        const allQuestions = snapshot.val();
        
        if (allQuestions) {
            questionsByCategory = {
                quran: allQuestions.quran || [],
                hadisy: allQuestions.hadisy || [],
                history: allQuestions.history || [],
                all: [...(allQuestions.quran || []), ...(allQuestions.hadisy || []), ...(allQuestions.history || [])]
            };
            
            for (const category in questionsByCategory) {
                questionsByCategory[category] = shuffleArray(questionsByCategory[category]);
            }
        } else {
            console.warn("Вопросы не найдены в базе данных");
            questionsByCategory = {
                quran: [{
                    question: "Сколько сур в Коране?",
                    answers: ["114", "113", "115", "112"],
                    correctAnswer: 0
                }],
                hadisy: [],
                history: [],
                all: []
            };
        }
    } catch (error) {
        console.error("Ошибка загрузки вопросов:", error);
    }
}

// Инициализация Telegram WebApp
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        userData = Telegram.WebApp.initDataUnsafe.user;
    }
}

// Обновление отображения GEM
function updateGemDisplay() {
    document.getElementById("profileGemCount").textContent = score;
    document.getElementById("gemBalance").textContent = score;
    document.getElementById("modalUserGem").textContent = score;
    localStorage.setItem("quizScore", score);
    
    if (userData) {
        updateUserData({ score: score });
    }
}

// Начало викторины
function startQuiz(category) {
    if (!questionsByCategory[category] || questionsByCategory[category].length === 0) {
        alert("Вопросы загружаются, попробуйте через несколько секунд");
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
        shuffledQuestions = shuffleArray(shuffledQuestions);
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
        questionElement.textContent = questionData.question;
        questionElement.classList.add("show");

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

    if (index === questionData.correctAnswer) {
        score++;
        updateGemDisplay();
        buttons[index].classList.add("correct");
    } else {
        buttons[index].classList.add("incorrect");
        buttons[questionData.correctAnswer].classList.add("correct");
    }

    buttons.forEach(button => button.disabled = true);
    setTimeout(loadNextQuestion, 1000);
}

// Следующий вопрос
function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// Перемешивание массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Реферальная система
function generateReferralLink() {
    const botUsername = "web3quiz_bot";
    return userData ? `https://t.me/${botUsername}?start=ref_${userId}` : `https://t.me/${botUsername}`;
}

function shareReferralLink() {
    const referralLink = generateReferralLink();
    const message = "Присоединяйтесь к викторине! " + referralLink;
    
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`);
    } else {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
    }
}

async function addReferral() {
    const referralCount = (parseInt(localStorage.getItem("referralCount")) || 0) + 1;
    localStorage.setItem("referralCount", referralCount.toString());
    
    score += 5;
    updateGemDisplay();
    updateReferralStats();
    
    if (userData) {
        await updateUserData({
            referrals: referralCount,
            score: score
        });
    }
}

function updateReferralStats() {
    const referralCount = parseInt(localStorage.getItem("referralCount")) || 0;
    document.getElementById("referralCount").textContent = referralCount;
    document.getElementById("referralBonus").textContent = referralCount * 5;
}

function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refUserId = urlParams.get("ref");

    if (refUserId && refUserId !== userId) {
        addReferral();
    }
}

// Магазин
function flipBook(book) {
    book.classList.toggle("flipped");
}

async function buyItem(price, itemName, event) {
    event.stopPropagation();
    if (score >= price) {
        score -= price;
        updateGemDisplay();
        
        if (userData) {
            try {
                await firebase.database().ref(`users/${userId}/purchases`).push({
                    item: itemName,
                    price: price,
                    date: new Date().toISOString()
                });
            } catch (error) {
                console.error("Ошибка сохранения покупки:", error);
            }
        }
        
        alert(`Вы купили: "${itemName}" за ${price} GEM`);
    } else {
        alert("Недостаточно GEM!");
    }
}

// Профиль
function openProfileModal() {
    const modal = document.getElementById("profileModal");
    modal.style.display = "flex";
    document.getElementById("modalUserGem").textContent = score;
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

window.onclick = function(event) {
    if (event.target === document.getElementById("profileModal")) {
        closeProfileModal();
    }
};

// Игра 1vs1
function startOneVsOne() {
    showPage("one-vs-one");
    document.getElementById("status").textContent = "Ожидание соперника...";
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

// Telegram подписка
function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank");
    score += 10;
    updateGemDisplay();
    alert("+10 GEM за подписку!");
}

// Переключение страниц
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });
    
    const pageElement = document.getElementById(`${pageId}-page`);
    if (pageElement) {
        pageElement.style.display = "block";
        
        if (pageId === 'leaders') {
            loadLeaderboard();
        }
    }

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });
    
    const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
    if (activeButton) {
        activeButton.classList.add("active");
    }
}

// Обновление профиля
function updateProfile() {
    const profileName = document.getElementById("profileName");
    const modalUserName = document.getElementById("modalUserName");
    const modalUserId = document.getElementById("modalUserId");

    if (userData) {
        const fullName = userData.first_name + (userData.last_name ? ` ${userData.last_name}` : '');
        profileName.textContent = fullName;
        modalUserName.textContent = fullName;
        modalUserId.textContent = userData.id || "Не определен";
    }
}

// Загрузка таблицы лидеров
async function loadLeaderboard() {
    try {
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = "<li>Загрузка...</li>";
        
        const snapshot = await firebase.database().ref('users').orderByChild('score').limitToLast(10).once('value');
        const users = [];
        
        snapshot.forEach(childSnapshot => {
            users.push(childSnapshot.val());
        });
        
        users.sort((a, b) => b.score - a.score);
        
        leaderboardElement.innerHTML = "";
        users.forEach((user, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${index + 1}. ${user.firstName || 'Аноним'}</strong>: ${user.score || 0} GEM`;
            leaderboardElement.appendChild(li);
        });
    } catch (error) {
        console.error("Ошибка загрузки таблицы лидеров:", error);
        document.getElementById("leaderboard").innerHTML = "<li>Ошибка загрузки</li>";
    }
}