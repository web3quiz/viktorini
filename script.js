let userId = '';
let score = 0;
let currentQuestionIndex = 0;

const questions = [
  {
    question: "Сколько будет 2 + 2?",
    options: ["3", "4", "5", "6"],
    answer: 1
  },
  {
    question: "Какая планета ближе всего к Солнцу?",
    options: ["Венера", "Меркурий", "Земля", "Марс"],
    answer: 1
  },
  {
    question: "Что такое HTML?",
    options: ["Язык программирования", "Язык разметки", "Система управления базами данных", "Фреймворк"],
    answer: 1
  }
];

document.getElementById('register-btn').addEventListener('click', () => {
  userId = document.getElementById('telegram-id').value;
  if (userId.trim()) {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    startQuiz();
  } else {
    alert('Пожалуйста, введите ваш Telegram ID');
  }
});

function startQuiz() {
  showQuestion();
}

function showQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById('question').textContent = question.question;
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.addEventListener('click', () => checkAnswer(index));
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  const question = questions[currentQuestionIndex];
  if (selectedIndex === question.answer) {
    score++;
    document.getElementById('score').textContent = score;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showProfile();
  }
}

function showProfile() {
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('profile-screen').classList.remove('hidden');
  document.getElementById('user-id').textContent = userId;
  document.getElementById('user-score').textContent = score;
}
