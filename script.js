let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = []; // Сюда будем сохранять перемешанные вопросы

// Оригинальный массив вопросов
const questions = [
    { question: "Как называется глава в Коране?", answers: ["Часть", "Заголовок", "Сура", "Аят"], correctAnswer: 2 },
    { question: "Сколько сур в Коране?", answers: ["112", "113", "114", "115"], correctAnswer: 2 },
    {
        "question": "Первый столп Имана - вера в ...?",
        "answers": ["Судный день", "Священные писания", "Аллаха", "Ангелов"],
        "correctAnswer": 2
      },
      {
        "question": "Шахада - ... столп Ислама.",
        "answers": ["5-й", "3-й", "1-й", "2-й"],
        "correctAnswer": 2
      },
      {
        "question": "Как звали отца Пророка? (мир ему и благословение Аллаhа)",
        "answers": ["Абдуллах", "Абдуль-Муталлиб", "Абу Талиб", "Хашим"],
        "correctAnswer": 0
      },
      {
        "question": "Что должен сказать чихнувший человек?",
        "answers": ["Субхан Аллах", "Альхамдулиллях", "Аллаху Акбар", "Ля Иляха Илля Ллях"],
        "correctAnswer": 1
      },
    { question: "Какой пророк упоминается чаще всего в Коране?", answers: ["Ибрахим", "Муса", "Нух", "Мухаммад"], correctAnswer: 1 }
];

// 🔄 Функция перемешивания массива (алгоритм Фишера-Йетса)
function shuffleArray(array) {
    let shuffled = array.slice(); // Копируем массив, чтобы не менять оригинал
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 🔥 Функция загрузки сохраненного прогресса
function loadProgress() {
    const savedIndex = localStorage.getItem("quizIndex");
    const savedScore = localStorage.getItem("quizScore");
    const savedQuestions = localStorage.getItem("shuffledQuestions");

    if (savedQuestions) {
        shuffledQuestions = JSON.parse(savedQuestions); // Загружаем перемешанный массив
    } else {
        shuffledQuestions = shuffleArray(questions); // Перемешиваем только если нет сохраненных данных
        localStorage.setItem("shuffledQuestions", JSON.stringify(shuffledQuestions));
    }

    if (savedIndex !== null) currentQuestionIndex = parseInt(savedIndex);
    if (savedScore !== null) score = parseInt(savedScore);

    updateGemDisplay();
}

// 🔥 Функция сохранения прогресса
function saveProgress() {
    localStorage.setItem("quizIndex", currentQuestionIndex);
    localStorage.setItem("quizScore", score);
}

// 🔥 Функция обновления GEM в игре и профиле
function updateGemDisplay() {
    document.getElementById("gemCount").innerText = score;
    document.getElementById("profileGemCount").innerText = score;
}

// 🔄 Функция загрузки текущего вопроса с анимацией
function loadQuestion() {
    if (currentQuestionIndex >= shuffledQuestions.length) {
        document.getElementById("nextQuestion").style.display = "none";
        document.getElementById("claimGem").style.display = "flex";
        return;
    }

    const questionData = shuffledQuestions[currentQuestionIndex];
    const questionElement = document.getElementById("question");
    const answersContainer = document.getElementById("answers");

    questionElement.classList.remove("show");
    answersContainer.innerHTML = "";

    setTimeout(() => {
        questionElement.innerText = questionData.question;
        questionElement.classList.add("show");

        questionData.answers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.classList.add("answer-button");
            button.innerText = answer;
            button.onclick = () => checkAnswer(index);

            setTimeout(() => {
                button.classList.add("show");
            }, index * 100);

            answersContainer.appendChild(button);
        });

        saveProgress();
    }, 300);
}

// 🔄 Функция проверки ответа
function checkAnswer(index) {
    const questionData = shuffledQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll(".answer-button");

    if (index === questionData.correctAnswer) {
        score++;
        updateGemDisplay();
        buttons[index].classList.add("correct");
        document.getElementById("correctSound").play();
    } else {
        buttons[index].classList.add("incorrect");
        buttons[questionData.correctAnswer].classList.add("correct");
        document.getElementById("incorrectSound").play();
    }

    buttons.forEach(button => button.disabled = true);
    setTimeout(loadNextQuestion, 1000);
}

// 🔄 Функция загрузки следующего вопроса
function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// 🔄 Функция завершения викторины
function claimGem() {
    alert("Викторина завершена! Вы заработали " + score + " GEM.");
    localStorage.clear();
}

// 🔄 Функция сброса викторины
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    shuffledQuestions = shuffleArray(questions); // Перемешиваем заново
    localStorage.setItem("shuffledQuestions", JSON.stringify(shuffledQuestions));
    updateGemDisplay();
    localStorage.removeItem("quizIndex");
    localStorage.removeItem("quizScore");

    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "flex";
    document.getElementById("claimGem").style.display = "none";

    loadQuestion();
}

// 🔄 Функция переключения страниц
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    document.getElementById(`${pageId}-page`).style.display = "block";
}

// 🔥 Загрузка прогресса и запуск викторины
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    loadQuestion();
    showPage('quiz');
});


// 🔥 Функция обновления GEM'ов
function updateGemDisplay() {
    document.getElementById("gemCount").innerText = score;
    document.getElementById("profileGemCount").innerText = score;
    localStorage.setItem("quizScore", score); // Сохраняем в localStorage
}

// 🔥 Функция "Пригласить друга" (+5 GEM)
function inviteFriend() {
    alert("Скопируйте и отправьте другу ссылку: https://yourgame.github.io/");
    score += 5;
    updateGemDisplay();
}

// 🔥 Функция "Подписаться на Telegram" (+3 GEM)
function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank"); // Открывает Telegram-канал
    alert("Спасибо за подписку! Вы получили +3 GEM.");
    score += 3;
    updateGemDisplay();
}

// 🔥 Функция "Посмотреть рекламу" (+2 GEM)
function watchAd() {
    alert("Представьте, что здесь реклама 😆. Вы получили +2 GEM!");
    score += 2;
    updateGemDisplay();
}

// Функция переключения страниц
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    document.getElementById(`${pageId}-page`).style.display = "block";

    // Обновляем активную кнопку навигации
    document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));
    const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
    if (activeButton) activeButton.classList.add("active");
}

// 🔥 Функция обновления GEM'ов
function updateGemDisplay() {
    document.getElementById("gemBalance").innerText = score;
    document.getElementById("gemCount").innerText = score;
    localStorage.setItem("quizScore", score);
}

// 🔥 Функция обновления GEM'ов
function updateGemDisplay() {
    document.getElementById("gemBalance").innerText = score;
    document.getElementById("gemCount").innerText = score;
    localStorage.setItem("quizScore", score);
}

// 📖 Функция переворота книги
function flipBook(book) {
    book.classList.toggle("flipped");
}

// 🛒 Функция покупки книг
function buyItem(price, itemName, event) {
    event.stopPropagation(); // Останавливаем клик, чтобы не переворачивалась книга

    if (score >= price) {
        score -= price;
        updateGemDisplay();
        alert(`Вы купили книгу: "${itemName}" 📚`);
    } else {
        alert("Недостаточно GEM'ов! 😢");
    }
}

// 🔥 Загружаем баланс при открытии магазина
document.addEventListener("DOMContentLoaded", () => {
    updateGemDisplay();
});
