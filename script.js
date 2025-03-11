let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem("quizScore")) || 0;
let shuffledQuestions = []; // Перемешанные вопросы



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
    question: "Сколько джузов в Коране?",
    answers: ["28", "30", "32", "34"],
    correctAnswer: 1 // Индекс правильного ответа
  },
  { 
    question: "В каком году родился Пророк Мухаммад ﷺ?",
    answers: ["570", "571", "572", "573"],
    correctAnswer: 1
  },
  { 
    question: "Что такое 'ният'?",
    answers: ["Поклонение", "Намерение", "Молитва", "Действие"],
    correctAnswer: 1
  },
  { 
    question: "Как называется вера в существование Единого и Единственного Бога (Аллаха)?",
    answers: ["Таухид", "Ислам", "Сунна", "Ширк"],
    correctAnswer: 0
  },
  { 
    question: "Сколько ворот у Рая?",
    answers: ["7", "8", "9", "10"],
    correctAnswer: 1
  },
  { 
    question: "За сколько дней были созданы небеса и земля?",
    answers: ["4", "5", "6", "7"],
    correctAnswer: 2
  },
  { 
    question: "Из чего сотворены ангелы?",
    answers: ["Из огня", "Из света", "Из воды", "Из воздуха"],
    correctAnswer: 1
  },
  { 
    question: "Как называется мост, перекинутый через Ад?",
    answers: ["Аль-Сырат", "Моста Рая", "Джасим", "Махшир"],
    correctAnswer: 0
  },
  { 
    question: "Как зовут ангела, который протрубит в рог перед Судным днём?",
    answers: ["Михаил", "Джибрил", "Исрафиль", "Азраил"],
    correctAnswer: 2
  },
  { 
    question: "Как называется человек, который знает Коран наизусть?",
    answers: ["Шейх", "Муэдзин", "Хафиз", "Имам"],
    correctAnswer: 2
  },
  { 
    question: "Сколько лет было Пророку Мухаммаду ﷺ, когда он стал пророком?",
    answers: ["35", "40", "45", "50"],
    correctAnswer: 1
  },
  { 
    question: "Из скольких ракятов состоит праздничный намаз?",
    answers: ["2", "3", "4", "5"],
    correctAnswer: 0
  },
  { 
    question: "Какой ширины будут двери Рая?",
    answers: ["40 лет пути", "50 лет пути", "60 лет пути", "70 лет пути"],
    correctAnswer: 0
  },
  { 
    question: "Пророк, который не умирал (мир ему)?",
    answers: ["Муса", "Иса", "Мухаммадﷺ", "Ибрагим"],
    correctAnswer: 1
  },
  { 
    question: "Как называется человек, читающий азан?",
    answers: ["Шейх", "Муэдзин", "Иман", "Хафиз"],
    correctAnswer: 1
  },
  { 
    question: "Какая сура должна быть обязательно прочтена в намазе?",
    answers: ["Аль-Ихлас", "Аль-Фатиха", "Аль-Бакара", "Аль-Кавсар"],
    correctAnswer: 1
  },
  { 
    question: "Как называется малое паломничество в священные места Мекки?",
    answers: ["Хадж", "Умра", "Джихад", "Итикаф"],
    correctAnswer: 1
  },
  { 
    question: "В какое время года родился пророк Мухаммадﷺ?",
    answers: ["Лето", "Осень", "Зима", "Весна"],
    correctAnswer: 3
  },
  { 
    question: "Кому было ниспослано Евангелие (Инджиль)?",
    answers: ["Ибрагиму", "Мусе", "Исе", "Мухаммадуﷺ"],
    correctAnswer: 2
  },
  { 
    question: "Кто из пророков упомянут в Коране очень часто?",
    answers: ["Мухаммадﷺ", "Муса", "Иса", "Нух"],
    correctAnswer: 1
  },
  { 
    question: "Кто из перечисленных не является Пророком?",
    answers: ["Узайр", "Иса", "Мухаммадﷺ", "Ибрагим"],
    correctAnswer: 0
  },
  { 
    question: "Что нужно сделать в первую очередь для принятия Ислама?",
    answers: ["Произнести шахаду", "Поститься", "Молиться"],
    correctAnswer: 0
  },
  { 
    question: "Сколько столпов Ислама?",
    answers: ["3", "4", "5", "6"],
    correctAnswer: 2
  },
  { 
    question: "Сколько столпов Имана?",
    answers: ["4", "5", "6", "7"],
    correctAnswer: 2
  },
  { 
    question: "В какой день наступит Судный день?",
    answers: ["Понедельник", "Четверг", "Пятница", "Воскресенье"],
    correctAnswer: 2
  },
  { 
    question: "Назовите первое слово Корана, явленное в откровении Пророку Мухаммаду ﷺ:",
    answers: ["Читай", "Творение", "Мир", "Поклонение"],
    correctAnswer: 0
  },
  {
question: "Кто из пророков мог общаться с животными и джинами?",
    answers: ["Сулейман", "Мухаммадﷺ", "Муса", "Иса"],
    correctAnswer: 0
  },
  { 
    question: "Читать эту суру Корана по пятницам является Сунной.",
    answers: ["Аль-Кахф", "Аль-Ихлас", "Аль-Фатиха", "Аль-Бакара"],
    correctAnswer: 0
  },
  { 
    question: "Во сколько лет Пророк Мухаммадﷺ стал пророком?",
    answers: ["35", "40", "45", "50"],
    correctAnswer: 1
  },
  { 
    question: "Как звали дедушку пророка Мухаммадаﷺ?",
    answers: ["Абдуллах", "Абдурахман", "Абдульмуталиб", "Абу Хурайра"],
    correctAnswer: 2
  },
  {
    "question": "Как звали мать Пророка Мухаммадаﷺ?",
    "answers": ["Аиша", "Фатима", "Амина", "Хадиджа"],
    "correctAnswer": 2
  },
  {
    "question": "Как звали отца Пророка Мухаммада ﷺ?",
    "answers": ["Абу Талиб", "Абдуллах", "Абдуль-Муталлиб", "Хашим"],
    "correctAnswer": 1
  },
  {
    "question": "Шахада -...столп Ислама",
    "answers": ["4-й", "2-й", "1-й", "3-й"],
    "correctAnswer": 2
  },
  {
    "question": "Первая женщина, принявшая Ислам.",
    "answers": ["Умм Салама", "Умм Хабиба", "Хадиджа", "'Аиша"],
    "correctAnswer": 2
  },
  {
    "question": "Дерево в Раю",
    "answers": ["Туба", "Тасним", "Сальсабиль", "Каусар"],
    "correctAnswer": 0
  },
  {
    "question": "Как называется искусство чтения Корана с правильным произношением?",
    "answers": ["Таджвит", "Кираат", "Тафсир", "Риваят"],
    "correctAnswer": 0
  },
  {
    "question": "Какую часть от денег следует отдавать в качестве закята?",
    "answers": ["10%", "2,5%", "5%", "1%"],
    "correctAnswer": 1
  },
  {
    "question": "В какой суре находится аят аль-Курсий?",
    "answers": ["Аль-Бакара", "Али-Имран", "Йа-Син", "Ан-Ниса"],
    "correctAnswer": 0
  },
  {
    "question": "Кто из Пророков был проглочен китом?",
    "answers": ["Сулейман, мир ему", "Муса, мир ему", "Идрис, мир ему", "Йунус, мир ему"],
    "correctAnswer": 3
  },
  {
    "question": "Как называется призыв на молитву, произносящийся непосредственно перед началом молитвы?",
    "answers": ["Аурат", "Икамат", "Закят", "Умра"],
    "correctAnswer": 1
  },
  {
    "question": "Как называется омовение песком при отсутствии воды?",
    "answers": ["Таяммум", "Гусль", "Истикъа", "Вуду"],
    "correctAnswer": 0
  },
  {
    "question": "Кто из Пророков построил священную Каабу в Мекке?",
    "answers": ["Сулейман (мир ему)", "Ибрахим и Исмаил (мир им)", "Иса (мир ему)", "Мухаммадﷺ"],
    "correctAnswer": 1
  },
  {
    "question": "Держать пост в эти дни является Сунной.",
    "answers": ["Понедельник и четверг", "Вторник и пятница", "Суббота и воскресенье", "Четверг и пятница"],
    "correctAnswer": 0
  },
  {
    "question": "Какой грех является самым страшным?",
    "answers": ["Убийство", "Воровство", "Многобожие", "Высокомерие"],
    "correctAnswer": 2
  },
  {
    "question": "Молитва - ... столп Ислама",
    "answers": ["1-й", "2-й", "3-й", "4-й"],
    "correctAnswer": 1
  },
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
  {
    "question": "Кто отказался совершить земной поклон перед Адамом, как повелел Аллах?",
    "answers": ["Иблис", "Идрис", "Карун", "Джибриль"],
    "correctAnswer": 0
  },
    { question: "Как называется глава в Коране?", answers: ["Часть", "Заголовок", "Сура", "Аят"], correctAnswer: 2 },
    { question: "Сколько сур в Коране?", answers: ["112", "113", "114", "115"], correctAnswer: 2 },
    { question: "Первый столп Имана - вера в ...?", answers: ["Судный день", "Священные писания", "Аллаха", "Ангелов"], correctAnswer: 2 },
    { question: "Шахада - ... столп Ислама.", answers: ["5-й", "3-й", "1-й", "2-й"], correctAnswer: 2 },
    { question: "Как звали отца Пророка?", answers: ["Абдуллах", "Абдуль-Муталлиб", "Абу Талиб", "Хашим"], correctAnswer: 0 },
    { question: "Что должен сказать чихнувший человек?", answers: ["Субхан Аллах", "Альхамдулиллях", "Аллаху Акбар", "Ля Иляха Илля Ллях"], correctAnswer: 1 },
    { question: "Какой пророк упоминается чаще всего в Коране?", answers: ["Ибрахим", "Муса", "Нух", "Мухаммад"], correctAnswer: 1 }
];

// 🔄 Функция перемешивания массива
function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 🔥 Загрузка сохраненного прогресса
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

// 🔥 Сохранение прогресса
function saveProgress() {
    localStorage.setItem("quizIndex", currentQuestionIndex);
    localStorage.setItem("quizScore", score);
}

// 🔥 Обновление GEM в игре и профиле
function updateGemDisplay() {
    document.getElementById("gemCount").innerText = score;
    document.getElementById("profileGemCount").innerText = score;
    document.getElementById("gemBalance").innerText = score;
    localStorage.setItem("quizScore", score);
}

// 🔄 Загрузка вопроса с анимацией
function loadQuestion() {
    if (currentQuestionIndex >= shuffledQuestions.length) {
        document.getElementById("nextQuestion").style.display = "none";
        document.getElementById("claimGem").style.display = "flex";
        return;
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
        saveProgress();
    }, 300);
}

// 🔄 Проверка ответа
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

// 🔄 Следующий вопрос
function loadNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// 🔄 Завершение викторины
function claimGem() {
    alert("Викторина завершена! Вы заработали " + score + " GEM.");
    localStorage.clear();
}

// 🔄 Сброс викторины
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
    document.getElementById("claimGem").style.display = "none";

    loadQuestion();
}

// 🔄 Переключение страниц
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    document.getElementById(`${pageId}-page`).style.display = "block";

    document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));
    const activeButton = document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`);
    if (activeButton) activeButton.classList.add("active");
}

// 🔥 Дополнительные способы получения GEM
function inviteFriend() {
    alert("Скопируйте и отправьте другу ссылку: https://yourgame.github.io/");
    score += 5;
    updateGemDisplay();
}

function subscribeTelegram() {
    window.open("https://t.me/islamskie_viktorini", "_blank");
    alert("Спасибо за подписку! Вы получили +3 GEM.");
    score += 3;
    updateGemDisplay();
}

function watchAd() {
    alert("Представьте, что здесь реклама 😆. Вы получили +2 GEM!");
    score += 2;
    updateGemDisplay();
}

// 📖 Переворот книги
function flipBook(book) {
    book.classList.toggle("flipped");
}

// 🛒 Покупка книги
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

// 🔥 Загрузка прогресса при старте
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    loadQuestion();
    showPage('quiz');
});

// Интеграция Telegram Web App для получения реального ID
function getTelegramId() {
    if (window.Telegram && window.Telegram.WebApp) {
        telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
        document.getElementById("telegramId").innerText = telegramId;
        document.getElementById("profileTelegramId").innerText = telegramId;
    } else {
        telegramId = "Не определен";
    }
}

// Функция для начала викторины
function startQuiz() {
    // Показываем контейнер с викториной
    document.getElementById("quizContent").style.display = "block";
    // Скрываем большие кнопки
    document.querySelector(".main-buttons").style.display = "none";
    // Загружаем первый вопрос
    loadQuestion();
}

// Функция для перезапуска викторины
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById("gemCount").innerText = score;
    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "flex";
    document.getElementById("claimGem").style.display = "none";
    // Показываем большие кнопки
    document.querySelector(".main-buttons").style.display = "flex";
    // Скрываем контейнер с викториной
    document.getElementById("quizContent").style.display = "none";
}

// Инициализация
getTelegramId();
showPage('quiz'); // По умолчанию показываем страницу викторины
