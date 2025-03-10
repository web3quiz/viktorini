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
    document.getElementById("claimGem").style.display = "none";
    document.getElementById("restartQuiz").style.display = "block";
}

// Функция для перезапуска викторины
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById("gemCount").innerText = score;
    document.getElementById("restartQuiz").style.display = "none";
    document.getElementById("nextQuestion").style.display = "block";
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

// Инициализация
getTelegramId();
loadQuestion();
