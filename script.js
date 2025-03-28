let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = [];
let questions = [];

const questionsByCategory = {
    quran: [
        {
            "question": "Сколько женщин упомянуто в Коране по имени?",
            "answers": ["Три", "Две", "Ни одна", "Одна"],
            "correctAnswer": 3
        },
        // ... остальные вопросы по Корану
    ],
    hadisy: [
        {
            question: "В каком году началась Вторая мировая война?",
            answers: ["1939", "1941", "1945", "1935"],
            correctAnswer: 0
        },
        // ... остальные вопросы по хадисам
    ],
    history: [
        {
            question: "Какой газ преобладает в атмосфере Земли?",
            answers: ["Кислород", "Азот", "Углекислый газ", "Водород"],
            correctAnswer: 1
        },
        // ... остальные вопросы по истории
    ],
    all: [
        {
            question: "Кто написал 'Войну и мир'?",
            answers: ["Лев Толстой", "Федор Достоевский", "Антон Чехов", "Иван Тургенев"],
            correctAnswer: 0
        },
        // ... остальные общие вопросы
    ]
};

function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function loadProgress() {
    const savedIndex = localStorage.getItem("quizIndex");
    const savedScore = localStorage.getItem("quizScore");
    const savedQuestions = localStorage.getItem("shuffledQuestions");

    shuffledQuestions = savedQuestions ? JSON.parse(savedQuestions) : shuffleArray(questions);
    if (!savedQuestions) localStorage.setItem("shuffledQuestions", JSON.stringify(shuffledQuestions));

    currentQuestionIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
    score = savedScore !== null ? parseInt(savedScore) : 0;

    updateGemDisplay();
}

function saveProgress() {
    localStorage.setItem("quizIndex", currentQuestionIndex);
    localStorage.setItem("quizScore", score);
}

function updateGemDisplay() {
    document.getElementById("profileGemCount").textContent = score;
    document.getElementById("gemBalance").textContent = score;
    document.getElementById("modalUserGem").textContent = score;
    localStorage.setItem("quizScore", score);
}

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
            button.classList.add("answer-button");
            button.textContent = answer;
            button.onclick = () => checkAnswer(index);

            setTimeout(() => button.classList.add("show"), index * 100);
            answersContainer.appendChild(button);
        });

        setTimeout(() => nextButton.classList.add("show"), 500);
        saveProgress();
    }, 300);
}

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

function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    shuffledQuestions = shuffleArray(questions);
    localStorage.setItem("shuffledQuestions", JSON.stringify(shuffledQuestions));
    localStorage.removeItem("quizIndex");
    localStorage.removeItem("quizScore");

    updateGemDisplay();
    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "flex";

    loadQuestion();
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    document.getElementById(`${pageId}-page`).style.display = "block";

    document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));
    const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
    if (activeButton) activeButton.classList.add("active");
}

function startQuiz(category) {
    questions = questionsByCategory[category];
    shuffledQuestions = shuffleArray(questions);
    currentQuestionIndex = 0;
    showPage('quiz');
    loadQuestion();
}

function startOneVsOne() {
    showPage("one-vs-one");
    const status = document.getElementById("status");
    status.textContent = "Поиск соперника...";
}

function openProfileModal() {
    const modal = document.getElementById("profileModal");
    modal.style.display = "flex";
    
    document.getElementById("modalUserName").textContent = document.getElementById("profileName").textContent;
    document.getElementById("modalUserGem").textContent = score;
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

function shareReferralLink() {
    const referralLink = generateReferralLink();
    const message = `Присоединяйтесь к викторине! ${referralLink}`;
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`);
    } else {
        navigator.clipboard.writeText(referralLink);
        alert("Ссылка скопирована в буфер обмена!");
    }
}

function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank");
    score += 10;
    updateGemDisplay();
}

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

function generateReferralLink() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            return `https://t.me/web3quiz_bot?start=ref_${user.id}`;
        }
    }
    return "https://t.me/web3quiz_bot";
}

document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    showPage('home');
    
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        const user = Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            document.getElementById("profileName").textContent = user.first_name || "Пользователь";
            document.getElementById("modalUserName").textContent = user.first_name || "Пользователь";
            document.getElementById("modalUserId").textContent = user.id || "Не определен";
        }
    }
});

// Блокировка выделения текста
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('Копирование запрещено');
    return false;
});

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'C' || 
         e.key === 'v' || e.key === 'V' ||
         e.key === 'a' || e.key === 'A' ||
         e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        alert('Копирование запрещено');
        return false;
    }
});



// Функция для добавления/обновления пользователя
function addUserToFirebase(user) {
    const userId = user.uid; // ID из авторизации Firebase
    const userName = user.displayName || "Аноним";
  
    db.collection("users").doc(userId).set({
      name: userName,
      gems: 0, // Начальное количество GEM
      referralCount: 0,
      createdAt: new Date()
    }, { merge: true }); // merge: true обновляет только указанные поля
  }
  
  // Пример вызова (после авторизации пользователя):
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      addUserToFirebase(user);
    }
  });



  // Конфигурация Firebase (замените на свою!)
  const firebaseConfig = {
    apiKey: "AIzaSyC6quHrp9tQbLwjUWrupw1C4ljQfPk3uNA",
    authDomain: "myquizapp-786ee.firebaseapp.com",
    databaseURL: "https://myquizapp-786ee-default-rtdb.firebaseio.com",
    projectId: "myquizapp-786ee",
    storageBucket: "myquizapp-786ee.firebasestorage.app",
    messagingSenderId: "351619904262",
    appId: "1:351619904262:web:67133361608fb0e22ce487"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Основные переменные
  let currentQuestionIndex = 0;
  let score = 0;
  
  // Загрузка вопросов
  async function loadQuestions(category) {
    const snapshot = await db.collection("questions")
      .where("category", "==", category)
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  }
  
  // Сохранение результата
  async function saveScore(userId, score) {
    await db.collection("users").doc(userId).set({
      lastScore: score,
      lastPlayed: new Date()
    }, { merge: true });
  }
  
  // Инициализация при загрузке страницы
  document.addEventListener("DOMContentLoaded", async () => {
    // Ваш существующий код инициализации
  });