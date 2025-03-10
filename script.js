let currentQuestionIndex = 0;
let score = 0;
let telegramId = "Не определен";

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
    // Остальные вопросы...
];

// Функция для отображения текущего вопроса
function loadQuestion() {
    const questionData = questions[currentQuestionIndex];
    document.getElementById("question").innerText = questionData.question;
    const answersContainer = document.getElementById("answers");
    answersContainer.innerHTML = "";
    questionData.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.innerText = answer;
        button.onclick = () => checkAnswer(index);
        answersContainer.appendChild(button);
    });
}

// Функция для проверки ответа
function checkAnswer(index) {
    const questionData = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll(".answers button");
    if (index === questionData.correctAnswer) {
        score++;
        document.getElementById("gemCount").innerText = score;
        buttons[index].classList.add("correct");
    } else {
        buttons[index].classList.add("incorrect");
        buttons[questionData.correctAnswer].classList.add("correct");
    }
    buttons.forEach(button => button.disabled = true);
    setTimeout(loadNextQuestion, 1000);
}

// Функция для загрузки следующего вопроса
function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        document.getElementById("nextQuestion").style.display = "none";
        document.getElementById("claimGem").style.display = "block";
    }
}

// Функция для завершения викторины
function claimGem() {
    alert("Викторина завершена! Вы заработали " + score + " GEM.");
    document.getElementById("nextQuestion").style.display = "none";
    document.getElementById("claimGem").style.display = "flex";
    document.getElementById("restartQuiz").style.display = "block";
    
}

// Функция для перезапуска викторины
function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById("gemCount").innerText = score;
  document.getElementById("restartQuiz").style.display = "none";
  document.getElementById("nextQuestion").style.display = "flex"; // Центрируем
  document.getElementById("claimGem").style.display = "none";
  loadQuestion();
}


// Функция для получения Telegram ID (эмуляция)
function getTelegramId() {
    telegramId = "123456789";
    document.getElementById("telegramId").innerText = telegramId;
}

// Функция для переключения страниц
function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => {
        page.classList.remove("active");
    });
    document.getElementById(`${pageId}-page`).classList.add("active");
}

// Инициализация
getTelegramId();
loadQuestion();
showPage('quiz'); // По умолчанию показываем страницу викторины
