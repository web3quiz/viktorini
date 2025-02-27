let currentQuestionIndex = 0;
let score = 0;
let telegramId = "Не определен";  // В реальном приложении здесь будет логика получения ID пользователя

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
question: 	"	Как называется вторая сура в Коране?	",
answers: ["		  Корова	",
"		  Люди	",
"		  Рассвет	",
"		  Женщины	"],
		correctAnswer: 0	
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
    answers: ["Тауид", "Ислам", "Сунна", "Ширк"],
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
    answers: ["Шейх", "Мюэдзин", "Хафиз", "Иман"],
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
    answers: ["Муса", "Иса", "Мухаммад", "Ибрагим"],
    correctAnswer: 1
  },
  { 
    question: "Как называется человек, читающий азан?",
    answers: ["Шейх", "Мюэдзин", "Иман", "Хафиз"],
    correctAnswer: 1
  },
  { 
    question: "Какая сура должна быть обязательно прочтена в намазе?",
    answers: ["Аль-Ихлас", "Аль-Фатиха", "Аль-Бакара", "Аль-Кавсар"],
    correctAnswer: 1
  },
  { 
    question: "Как называется малое паломничество в священные места Мекки?",
    answers: ["Хадж", "Умра", "Джихад", "Иткаф"],
    correctAnswer: 1
  },
  { 
    question: "В какое время года родился пророк Мухаммад ﷺ?",
    answers: ["Лето", "Осень", "Зима", "Весна"],
    correctAnswer: 2
  },
  { 
    question: "Как назывался год, в котором родился пророк Мухаммад ﷺ?",
    answers: ["Год слона", "Год мыши", "Год льва", "Год змеи"],
    correctAnswer: 0
  },
  { 
    question: "Кому было ниспослано Евангелие (Инджиль)?",
    answers: ["Ибрагиму", "Мусе", "Исе", "Мухаммаду"],
    correctAnswer: 2
  },
  { 
    question: "Кто из пророков упомянут в Коране очень часто?",
    answers: ["Мухаммад", "Муса", "Иса", "Нух"],
    correctAnswer: 1
  },
  { 
    question: "Какой признак судного дня НЕ является малым признаком?",
    answers: ["Возвращение Исы", "Появление Яджудж и Маджудж", "Появление Антихриста", "Уничтожение арабов"],
    correctAnswer: 1
  },
  { 
    question: "Кто из перечисленных не является Пророком?",
    answers: ["Узайр", "Иса", "Мухаммад", "Ибрагим"],
    correctAnswer: 0
  },
  { 
    question: "Что нужно сделать в первую очередь для принятия Ислама?",
    answers: ["Произнести шахаду", "Поститься", "Молиться", "Поклоняться святыням"],
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
    question: "Кто из пророков мог общаться с животными и джиннами?",
    answers: ["Сулейман", "Мухаммад", "Муса", "Иса"],
    correctAnswer: 0
  },
  { 
    question: "Читать эту суру Корана по пятницам является Сунной.",
    answers: ["Аль-Кахф", "Аль-Ихлас", "Аль-Фатиха", "Аль-Бакара"],
    correctAnswer: 0
  },
  { 
    question: "Во сколько лет Пророк Мухаммад ﷺ стал пророком?",
    answers: ["35", "40", "45", "50"],
    correctAnswer: 1
  },
  { 
    question: "Как звали дедушку пророка Мухаммада?",
    answers: ["Абдуллах", "Абдурахман", "Абдульмуталиб", "Абу Хурайра"],
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
