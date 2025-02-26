let currentQuestionIndex = 0;
let score = 0;
let telegramId = "Не определен";  // В реальном приложении здесь будет логика получения ID пользователя

// Викторины (вопросы, ответы и правильный ответ)
const questions = [
    {
        question: "Что такое JavaScript?",
        answers: ["Язык программирования", "Программа", "Браузер", "Операционная система"],
        correctAnswer: 0 // Индекс правильного ответа
    },
    {
	question: "Как называется глава в Коране?",
        answers: ["Часть", "Заголовок", "Сура", "Аят"],
	correctAnswer: 2
    },
	{			
question: 	"	Сколько сур в Коране?	",
answers: ["		112	",
"		113	",
"		114	",
"		115	"],
		correctAnswer: 2	
},			
    {
        question: "Какой оператор используется для сравнения в JavaScript?",
        answers: ["=", "==", "===", "<>"],
        correctAnswer: 2
    },
    {
        question: "Что такое DOM?",
        answers: ["Библиотека JavaScript", "Объектно-ориентированная модель", "Модель документа", "Фреймворк"],
        correctAnswer: 2
    }
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

    // Отключаем все кнопки после ответа
    buttons.forEach(button => button.disabled = true);
}

// Функция для загрузки следующего вопроса
function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        alert("Вы завершили викторину!");
    }
}

// Функция для получения Telegram ID (эмуляция)
function getTelegramId() {
    // Для настоящего сайта потребуется API Telegram для получения ID
    telegramId = "123456789"; // Эмуляция Telegram ID
    document.getElementById("telegramId").innerText = telegramId;
}

// Инициализация
getTelegramId();
loadQuestion();
