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
        },
        {
            question: "Какая сура самая длинная в Коране?",
            answers: ["Аль-Имран", "Аль-Бакара", "Ан-Ниса", "Аль-Маида"],
            correctAnswer: 1
        },
        {
            question: "Какая сура была ниспослана первой?",
            answers: ["Аль-Фатиха", "Аль-Аляк", "Аль-Ихлас", "Аль-Бакара"],
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
        },
        {
            question: "Какое дело Пророк (ﷺ) назвал лучшим после обязательной молитвы?",
            answers: ["Доброе слово", "Джихад", "Поминание Аллаха", "Доброе отношение к родителям"],
            correctAnswer: 3
        },
        {
            question: "Что разрушает благие дела, как огонь дрова?",
            answers: ["Лень", "Гордыня", "Зависть", "Злословие"],
            correctAnswer: 1
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
        },
        {
            question: "Кто из сподвижников был известен как 'Обладатель двух светов'?",
            answers: ["Абу Бакр", "Усман ибн Аффан", "Билял", "Али ибн Абу Талиб"],
            correctAnswer: 1
        },
        {
            question: "В какой битве мусульмане впервые столкнулись с византийцами?",
            answers: ["Бадр", "Ухуд", "Мута", "Хунайн"],
            correctAnswer: 2
        }
    ]
};
temporaryQuestions.all = [...temporaryQuestions.quran, ...temporaryQuestions.hadisy, ...temporaryQuestions.history];

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

// Загрузка вопросов из Firebase
async function loadQuestionsFromFirebase() {
    try {
        const snapshot = await firebase.database().ref('questions').once('value');
        const firebaseQuestions = snapshot.val();
        
        questionsByCategory = firebaseQuestions || temporaryQuestions;
        
        // Перемешиваем вопросы
        for (const category in questionsByCategory) {
            if (category !== 'all') {
                questionsByCategory[category] = shuffleArray(questionsByCategory[category]);
            }
        }
        
        // Обновляем объединенную категорию
        questionsByCategory.all = [
            ...(questionsByCategory.quran || []),
            ...(questionsByCategory.hadisy || []),
            ...(questionsByCategory.history || [])
        ];
        
    } catch (error) {
        console.error("Ошибка загрузки вопросов:", error);
        questionsByCategory = temporaryQuestions;
    }
}

// Инициализация данных пользователя
async function initUserData() {
    // Проверяем localStorage
    const savedScore = localStorage.getItem("quizScore");
    if (savedScore) score = parseInt(savedScore);
    
    const savedRefCount = localStorage.getItem("referralCount");
    if (savedRefCount) referralCount = parseInt(savedRefCount);

    if (window.Telegram && window.Telegram.WebApp && Telegram.WebApp.initDataUnsafe.user) {
        userData = Telegram.WebApp.initDataUnsafe.user;
        userId = userData.id.toString();
        
        try {
            const snapshot = await firebase.database().ref('users/' + userId).once('value');
            
            if (!snapshot.exists()) {
                await saveUserData({
                    id: userId,
                    firstName: userData.first_name,
                    lastName: userData.last_name || '',
                    username: userData.username || '',
                    score: score,
                    referrals: referralCount,
                    lastActive: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                });
            } else {
                const user = snapshot.val();
                score = user.score || score;
                referralCount = user.referrals || referralCount;
                localStorage.setItem("quizScore", score);
                localStorage.setItem("referralCount", referralCount);
                await updateUserData({ lastActive: new Date().toISOString() });
            }
        } catch (error) {
            console.error("Ошибка загрузки пользователя:", error);
            userId = "guest_" + Math.random().toString(36).substr(2, 9);
        }
    } else {
        userId = "guest_" + Math.random().toString(36).substr(2, 9);
    }
    
    updateGemDisplay();
}

// Сохранение данных пользователя
async function saveUserData(data) {
    try {
        await firebase.database().ref('users/' + data.id).set(data);
    } catch (error) {
        console.error("Ошибка сохранения:", error);
    }
}

// Обновление данных пользователя
async function updateUserData(updates) {
    try {
        if (!userId.startsWith("guest_")) {
            await firebase.database().ref('users/' + userId).update({
                ...updates,
                lastActive: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error("Ошибка обновления:", error);
    }
}

// Обновление счета
async function updateScore(points) {
    score += points;
    localStorage.setItem("quizScore", score);
    
    if (!userId.startsWith("guest_")) {
        await updateUserData({ score: score });
    }
    
    updateGemDisplay();
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
}

// Викторина
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

function loadQuestion() {
    if (currentQuestionIndex >= shuffledQuestions.length) {
        currentQuestionIndex = 0;
        shuffledQuestions = shuffleArray(shuffledQuestions);
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

function checkAnswer(index) {
    const questionData = shuffledQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll(".answer-button");

    if (index === questionData.correctAnswer) {
        updateScore(1);
        buttons[index].classList.add("correct");
    } else {
        buttons[index].classList.add("incorrect");
        buttons[questionData.correctAnswer].classList.add("correct");
    }

    buttons.forEach(button => button.disabled = true);
    setTimeout(loadNextQuestion, 1000);
}

function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// Реферальная система
function generateReferralLink() {
    const botUsername = "web3quiz_bot";
    return userData ? `https://t.me/${botUsername}?start=ref_${userId}` : `https://t.me/${botUsername}`;
}

async function addReferral() {
    referralCount++;
    localStorage.setItem("referralCount", referralCount);
    updateScore(5);
    updateReferralStats();
    
    if (!userId.startsWith("guest_")) {
        await updateUserData({ referrals: referralCount });
    }
}

function updateReferralStats() {
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
        await updateScore(-price);
        
        if (!userId.startsWith("guest_")) {
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

// Вспомогательные функции
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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

// Таблица лидеров
async function loadLeaderboard() {
    try {
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = "<li>Загрузка...</li>";
        
        const snapshot = await firebase.database().ref('users').orderByChild('score').limitToLast(10).once('value');
        const users = [];
        
        snapshot.forEach(childSnapshot => {
            users.push(childSnapshot.val());
        });
        
        users.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        leaderboardElement.innerHTML = "";
        users.forEach((user, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="leader-position">${index + 1}</span>
                <span class="leader-name">${user.firstName || 'Аноним'} ${user.lastName || ''}</span>
                <span class="leader-score">${user.score || 0} GEM</span>
            `;
            leaderboardElement.appendChild(li);
        });
    } catch (error) {
        console.error("Ошибка загрузки таблицы лидеров:", error);
        document.getElementById("leaderboard").innerHTML = "<li>Ошибка загрузки</li>";
    }
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
    updateScore(10);
    alert("+10 GEM за подписку!");
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

// Добавление новых вопросов в Firebase (для админа)
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