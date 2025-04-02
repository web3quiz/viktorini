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

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Основные переменные
let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = [];
let userData = null;
let questionsByCategory = {
    quran: [],
    hadisy: [],
    history: [],
    all: []
};

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", async () => {
    initTelegramWebApp();
    await loadQuestionsFromFirebase();
    loadProgress();
    updateProfile();
    updateReferralStats();
    checkReferral();
    showPage('home');
    setupCopyProtection();
});

// Загрузка вопросов из Firebase
async function loadQuestionsFromFirebase() {
    try {
        const snapshot = await database.ref('questions').once('value');
        const allQuestions = snapshot.val();
        
        if (allQuestions) {
            questionsByCategory = {
                quran: allQuestions.quran || [],
                hadisy: allQuestions.hadisy || [],
                history: allQuestions.history || [],
                all: [...(allQuestions.quran || []), ...(allQuestions.hadisy || []), ...(allQuestions.history || [])]
            };
            
            // Перемешиваем все вопросы при загрузке
            for (const category in questionsByCategory) {
                questionsByCategory[category] = shuffleArray(questionsByCategory[category]);
            }
        } else {
            console.error("No questions found in Firebase");
            // Можно добавить вопросы по умолчанию на случай ошибки
        }
    } catch (error) {
        console.error("Error loading questions:", error);
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

// Загрузка прогресса
function loadProgress() {
    score = parseInt(localStorage.getItem("quizScore")) || 0;
    updateGemDisplay();
}

// Сохранение прогресса
function saveProgress() {
    localStorage.setItem("quizScore", score);
}

// Обновление отображения GEM
function updateGemDisplay() {
    document.getElementById("profileGemCount").innerText = score;
    document.getElementById("gemBalance").innerText = score;
    document.getElementById("modalUserGem").innerText = score;
    saveProgress();
}

// Переключение страниц
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    document.getElementById(`${pageId}-page`).style.display = "block";

    document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));
    const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
    if (activeButton) activeButton.classList.add("active");
}

// Начало викторины
function startQuiz(category) {
    if (questionsByCategory[category].length === 0) {
        alert("Вопросы загружаются, попробуйте через несколько секунд");
        return;
    }
    
    shuffledQuestions = [...questionsByCategory[category]]; // Создаем копию
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
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Обновление профиля
function updateProfile() {
    const profileName = document.getElementById("profileName");
    const modalUserName = document.getElementById("modalUserName");
    const modalUserId = document.getElementById("modalUserId");

    if (userData) {
        const fullName = userData.first_name + (userData.last_name ? ` ${userData.last_name}` : "");
        profileName.innerText = fullName;
        modalUserName.innerText = fullName;
        modalUserId.innerText = userData.id || "Не определен";
    } else {
        profileName.innerText = "Пользователь";
        modalUserName.innerText = "Пользователь";
        modalUserId.innerText = "Не определен";
    }
}

// Реферальная система
function generateReferralLink() {
    if (userData) {
        const userId = userData.id;
        const botUsername = "web3quiz_bot";
        return `https://t.me/${botUsername}?start=ref_${userId}`;
    }
    return "https://t.me/web3quiz_bot";
}

function shareReferralLink() {
    const referralLink = generateReferralLink();
    const message = `Ассаляму алейкум! Присоединяйтесь к викторине! ${referralLink}`;
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Ассаляму алейкум! Присоединяйтесь к викторине!")}`);
    } else {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Ассаляму алейкум! Присоединяйтесь к викторине")}`, '_blank');
    }
}

function getReferralCount() {
    return parseInt(localStorage.getItem("referralCount")) || 0;
}

function updateReferralStats() {
    const referralCount = getReferralCount();
    document.getElementById("referralCount").innerText = referralCount;
    document.getElementById("referralBonus").innerText = referralCount * 5;
}

function addReferral() {
    let referralCount = getReferralCount();
    referralCount += 1;
    localStorage.setItem("referralCount", referralCount.toString());
    
    score += 5;
    updateGemDisplay();
    updateReferralStats();
}

function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refUserId = urlParams.get("ref");

    if (refUserId) {
        const currentUserId = userData?.id || "0";
        if (refUserId !== currentUserId) {
            addReferral();
        }
    }
}

// Магазин
function flipBook(book) {
    book.classList.toggle("flipped");
}

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

// Профиль
function openProfileModal() {
    const modal = document.getElementById("profileModal");
    modal.style.display = "flex";
    document.getElementById("modalUserGem").innerText = score;
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("profileModal");
    if (event.target === modal) {
        closeProfileModal();
    }
};

// Игра 1vs1
function startOneVsOne() {
    showPage("one-vs-one");
    const status = document.getElementById("status");
    status.innerText = "Ожидание соперника...";
}

// Защита от копирования
function setupCopyProtection() {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showCopyAlert();
        return false;
    });
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === 'c' || e.key === 'C' || 
             e.key === 'v' || e.key === 'V' ||
             e.key === 'a' || e.key === 'A' ||
             e.key === 'x' || e.key === 'X')) {
            e.preventDefault();
            showCopyAlert();
            return false;
        }
    });
    
    function showCopyAlert() {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.showAlert('Копирование материалов запрещено');
        } else {
            alert('Копирование материалов запрещено');
        }
    }
}

// Telegram подписка
function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank");
    score += 3;
    updateGemDisplay();
    alert("Спасибо за подписку! Вы получили +3 GEM.");
}






// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", async () => {
    initTelegramWebApp();
    await loadQuestionsFromFirebase();
    await initUserData();
    loadLocalProgress();
    updateProfile();
    updateReferralStats();
    checkReferral();
    showPage('home');
    setupCopyProtection();
});

// Инициализация данных пользователя
async function initUserData() {
    if (userData) {
        userId = userData.id.toString();
        // Проверяем, есть ли пользователь в базе
        const snapshot = await database.ref('users/' + userId).once('value');
        
        if (!snapshot.exists()) {
            // Создаем новую запись пользователя
            await saveUserData({
                id: userId,
                firstName: userData.first_name,
                lastName: userData.last_name || '',
                username: userData.username || '',
                score: 0,
                referrals: 0,
                lastActive: new Date().toISOString()
            });
        } else {
            // Обновляем время последней активности
            await updateUserData({
                lastActive: new Date().toISOString()
            });
            // Загружаем счет из базы
            score = snapshot.val().score || 0;
        }
    } else {
        // Для работы вне Telegram используем локальное хранилище
        userId = "local_" + Math.random().toString(36).substr(2, 9);
        score = parseInt(localStorage.getItem("quizScore")) || 0;
    }
}

// Сохранение данных пользователя
async function saveUserData(data) {
    try {
        await database.ref('users/' + userId).set(data);
        console.log("User data saved to Firebase");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

// Обновление данных пользователя
async function updateUserData(updates) {
    try {
        await database.ref('users/' + userId).update(updates);
        console.log("User data updated in Firebase");
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// Загрузка вопросов из Firebase
async function loadQuestionsFromFirebase() {
    try {
        const snapshot = await database.ref('questions').once('value');
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
        }
    } catch (error) {
        console.error("Error loading questions:", error);
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

// Загрузка прогресса
function loadLocalProgress() {
    if (!userData) {
        score = parseInt(localStorage.getItem("quizScore")) || 0;
    }
    updateGemDisplay();
}

// Обновление отображения GEM
function updateGemDisplay() {
    document.getElementById("profileGemCount").innerText = score;
    document.getElementById("gemBalance").innerText = score;
    document.getElementById("modalUserGem").innerText = score;
    
    // Сохраняем локально и в Firebase
    localStorage.setItem("quizScore", score);
    if (userData) {
        updateUserData({ score: score });
    }
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

// Добавление реферала
async function addReferral() {
    let referralCount = getReferralCount();
    referralCount += 1;
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

// Магазин - покупка предмета
async function buyItem(price, itemName, event) {
    event.stopPropagation();
    if (score >= price) {
        score -= price;
        updateGemDisplay();
        
        if (userData) {
            // Сохраняем историю покупок
            const purchase = {
                item: itemName,
                price: price,
                date: new Date().toISOString()
            };
            
            await database.ref(`users/${userId}/purchases`).push(purchase);
        }
        
        alert(`Вы купили книгу: "${itemName}" 📚`);
    } else {
        alert("Недостаточно GEM'ов! 😢");
    }
}

// Обновление профиля
function updateProfile() {
    const profileName = document.getElementById("profileName");
    const modalUserName = document.getElementById("modalUserName");
    const modalUserId = document.getElementById("modalUserId");

    if (userData) {
        const fullName = userData.first_name + (userData.last_name ? ` ${userData.last_name}` : "");
        profileName.innerText = fullName;
        modalUserName.innerText = fullName;
        modalUserId.innerText = userData.id || "Не определен";
    } else {
        profileName.innerText = "Пользователь";
        modalUserName.innerText = "Пользователь";
        modalUserId.innerText = "Не определен";
    }
}

// Остальные функции остаются без изменений (showPage, startQuiz, loadQuestion, shuffleArray и т.д.)
// ...