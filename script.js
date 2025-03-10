let currentQuestionIndex = 0;
let score = 0;

// Викторины (вопросы, ответы и правильный ответ)
const questions = [
    {
        question: "Как называется глава в Коране?",
        answers: ["Часть", "Заголовок", "Сура", "Аят"],
        correctAnswer: 2
    },
    {
        question: "Сколько сур в Коране?",
        answers: ["112", "113", "114", "115"],
        correctAnswer: 2
    },
    {
        question: "Какой пророк упоминается чаще всего в Коране?",
        answers: ["Ибрахим", "Муса", "Нух", "Мухаммад"],
        correctAnswer: 1
    }
];

// 🔥 Функция загрузки сохраненного прогресса
function loadProgress() {
    const savedIndex = localStorage.getItem("quizIndex");
    const savedScore = localStorage.getItem("quizScore");

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

// Функция для отображения текущего вопроса
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        document.getElementById("nextQuestion").style.display = "none";
        document.getElementById("claimGem").style.display = "flex";
        return;
    }

    const questionData = questions[currentQuestionIndex];
    document.getElementById("question").innerText = questionData.question;

    const answersContainer = document.getElementById("answers");
    answersContainer.innerHTML = ""; // Очистка предыдущих ответов

    questionData.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.classList.add("answer-button");
        button.innerText = answer;
        button.onclick = () => checkAnswer(index);
        answersContainer.appendChild(button);
    });

    // Сохраняем прогресс после загрузки вопроса
    saveProgress();
}

// Функция для проверки ответа
function checkAnswer(index) {
    const questionData = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll(".answer-button");

    if (index === questionData.correctAnswer) {
        score++;
        updateGemDisplay(); // Обновляем GEM и в профиле
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

// Функция для загрузки следующего вопроса
function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// Функция для завершения викторины
function claimGem() {
    alert("Викторина завершена! Вы заработали " + score + " GEM.");
    document.getElementById("claimGem").style.display = "none";
    document.getElementById("restartQuiz").style.display = "flex";

    // Очищаем прогресс после завершения
    localStorage.removeItem("quizIndex");
    localStorage.removeItem("quizScore");
}

// Функция для перезапуска викторины
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    updateGemDisplay(); // Сбрасываем GEM и в профиле
    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "flex";
    document.getElementById("claimGem").style.display = "none";

    localStorage.removeItem("quizIndex");
    localStorage.removeItem("quizScore");

    loadQuestion();
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

// 🔥 Загрузка прогресса и инициализация
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    loadQuestion();
    showPage('quiz'); // Открываем страницу викторины по умолчанию
});
