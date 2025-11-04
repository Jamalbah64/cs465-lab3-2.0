/*
 * My Qzicl quiz application
 *
 * This script holds all of the quiz data and the logic to display topics,
 * quizzes, questions, and the final score.
 */

const topics = [
  {
    id: 1,
    name: 'European Union',
    quizzes: [
      { quizID: 'eu-capitals', title: 'EU Capitals' },
      { quizID: 'eu-flags', title: 'EU Flags' },
      { quizID: 'eu-landmarks', title: 'EU Landmarks' }
    ]
  },
  {
    id: 2,
    name: 'Science',
    quizzes: [
      { quizID: 'physics-fundamentals', title: 'Physics Fundamentals' },
      { quizID: 'space-exploration', title: 'Space Exploration' }
    ]
  },
  {
    id: 3,
    name: 'Cars',
    quizzes: [
      { quizID: 'cars-brands', title: 'Car Brands' },
      { quizID: 'cars-history', title: 'Car History' },
      { quizID: 'cars-parts', title: 'Car Parts' }
    ]
  }
];

// A registry of all quiz definitions. Each quiz has a title, an
// intro message, and an array of questions with possible answers and the
// correct answer. 
const quizzes = {
  'eu-capitals': {
    title: 'EU Capitals',
    quizMessage: 'Match EU members to their capitals.',
    questions: [
      {
        question: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        answer: 'Paris'
      },
      {
        question: 'What is the capital of Germany?',
        options: ['Vienna', 'Berlin', 'Prague', 'Bern'],
        answer: 'Berlin'
      },
      {
        question: 'What is the capital of Italy?',
        options: ['Rome', 'Milan', 'Naples', 'Turin'],
        answer: 'Rome'
      }
    ]
  },
  'eu-flags': {
    title: 'EU Flags',
    quizMessage: 'Identify the member by its flag colors or symbols.',
    questions: [
      {
        question: 'Which country\'s flag has three vertical stripes: green, white, and orange?',
        options: ['Ireland', 'Italy', 'Hungary', 'Bulgaria'],
        answer: 'Ireland'
      },
      {
        question: 'Which flag has a yellow Nordic cross on a blue field?',
        options: ['Finland', 'Sweden', 'Denmark', 'Estonia'],
        answer: 'Sweden'
      },
      {
        question: 'Which flag consists of three horizontal bands: black, red, and gold?',
        options: ['Belgium', 'Germany', 'Spain', 'Austria'],
        answer: 'Germany'
      }
    ]
  },
  'eu-landmarks': {
    title: 'EU Landmarks',
    quizMessage: 'Match iconic landmarks to their EU locations.',
    questions: [
      {
        question: 'The Sagrada Família is located in which city?',
        options: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
        answer: 'Barcelona'
      },
      {
        question: 'The Acropolis overlooks which capital?',
        options: ['Athens', 'Sofia', 'Bucharest', 'Zagreb'],
        answer: 'Athens'
      },
      {
        question: 'The Atomium is a landmark in which EU capital?',
        options: ['Amsterdam', 'Brussels', 'Luxembourg City', 'Vienna'],
        answer: 'Brussels'
      }
    ]
  },
  'physics-fundamentals': {
    title: 'Physics Fundamentals',
    quizMessage: 'Test basics of kinematics and forces.',
    questions: [
      {
        question: 'What is the SI unit of force?',
        options: ['Joule', 'Pascal', 'Newton', 'Watt'],
        answer: 'Newton'
      },
      {
        question: 'Acceleration due to gravity near Earth’s surface is about:',
        options: ['1.6 m/s^2', '3.7 m/s^2', '9.8 m/s^2', '24.8 m/s^2'],
        answer: '9.8 m/s^2'
      },
      {
        question: 'F = ma is associated with which scientist?',
        options: ['Galileo', 'Newton', 'Einstein', 'Maxwell'],
        answer: 'Newton'
      }
    ]
  },
  'space-exploration': {
    title: 'Space Exploration',
    quizMessage: 'Missions and objects in our solar system.',
    questions: [
      {
        question: 'Which planet did the Perseverance rover land on in 2021?',
        options: ['Venus', 'Mars', 'Mercury', 'Moon'],
        answer: 'Mars'
      },
      {
        question: 'The Hubble Space Telescope orbits:',
        options: ['The Moon', 'The Sun', 'Earth', 'Mars'],
        answer: 'Earth'
      },
      {
        question: 'Which is the largest planet in our solar system?',
        options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'],
        answer: 'Jupiter'
      }
    ]
  },
  'cars-brands': {
    title: 'Car Brands',
    quizMessage: 'Match brands to their origins or badges.',
    questions: [
      {
        question: 'Which brand is from Japan?',
        options: ['BMW', 'Toyota', 'Renault', 'Volvo'],
        answer: 'Toyota'
      },
      {
        question: 'Which brand’s logo is a three‑pointed star?',
        options: ['Mercedes-Benz', 'Subaru', 'Mazda', 'Peugeot'],
        answer: 'Mercedes-Benz'
      },
      {
        question: 'Which brand is part of the Volkswagen Group?',
        options: ['Peugeot', 'SEAT', 'Fiat', 'Volvo'],
        answer: 'SEAT'
      }
    ]
  },
  'cars-history': {
    title: 'Car History',
    quizMessage: 'Milestones in automotive development.',
    questions: [
      {
        question: 'Who is often credited with the first practical automobile (Benz Patent‑Motorwagen)?',
        options: ['Henry Ford', 'Karl Benz', 'Gottlieb Daimler', 'Ferdinand Porsche'],
        answer: 'Karl Benz'
      },
      {
        question: 'Ford’s Model T was first produced in:',
        options: ['1899', '1908', '1918', '1927'],
        answer: '1908'
      },
      {
        question: 'The widespread adoption of unibody construction began around which decade?',
        options: ['1920s', '1950s', '1970s', '1990s'],
        answer: '1950s'
      }
    ]
  },
  'cars-parts': {
    title: 'Car Parts',
    quizMessage: 'Identify essential automotive components.',
    questions: [
      {
        question: 'Which component stores electrical energy to start the engine?',
        options: ['Alternator', 'Battery', 'Starter motor', 'Ignition coil'],
        answer: 'Battery'
      },
      {
        question: 'What does the catalytic converter primarily reduce?',
        options: ['Fuel consumption', 'Engine temperature', 'Exhaust emissions', 'Oil viscosity'],
        answer: 'Exhaust emissions'
      },
      {
        question: 'Which part transfers power from transmission to wheels?',
        options: ['Radiator', 'Differential', 'Exhaust manifold', 'Throttle body'],
        answer: 'Differential'
      }
    ]
  }
};

// State variables to track the user’s progress. These will be updated
// as the user navigates through the app.
let currentTopic = null;
let currentQuiz = null;
let questionIndex = 0;
let score = 0;

// Grab the DOM element where the app will render its content
const app = document.getElementById('app');

// Display the list of topics. We build up a bit of HTML and then
// attach event listeners to the buttons once the DOM is updated.
function showTopics() {
  currentTopic = null;
  currentQuiz = null;
  questionIndex = 0;
  score = 0;
  let html = '<h1>Welcome to Qzicl</h1>';
  html += '<p>Select a topic to get started.</p>';
  html += '<ul>';
  topics.forEach(t => {
    html += `<li><button class="topic-btn" data-id="${t.id}">${t.name}</button></li>`;
  });
  html += '</ul>';
  app.innerHTML = html;
  // Hook up the topic buttons to update the current topic and show quizzes
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      currentTopic = topics.find(t => t.id === id);
      showQuizzes();
    });
  });
}

// Show the quizzes available under the selected topic. We list them
// as buttons and wire each up to prepare the quiz.
function showQuizzes() {
  if (!currentTopic) return;
  let html = `<h2>${currentTopic.name} — Quizzes</h2>`;
  html += '<button id="back-to-topics">← Back to Topics</button>';
  html += '<ul>';
  currentTopic.quizzes.forEach(q => {
    html += `<li><button class="quiz-btn" data-id="${q.quizID}">${q.title}</button></li>`;
  });
  html += '</ul>';
  app.innerHTML = html;
  // Back button to return to the list of topics
  document.getElementById('back-to-topics').addEventListener('click', showTopics);
  // Each quiz button sets the current quiz and shows the intro screen
  document.querySelectorAll('.quiz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      currentQuiz = quizzes[id];
      showReady();
    });
  });
}

// Show the ready screen. This introduces the quiz and provides a
// start button. The user can also back out to the list of quizzes.
function showReady() {
  if (!currentQuiz) return;
  let html = `<h2>${currentQuiz.title}</h2>`;
  if (currentQuiz.quizMessage) {
    html += `<p>${currentQuiz.quizMessage}</p>`;
  }
  html += '<button id="start-quiz">Go!</button>';
  html += '<button id="exit-to-topics" style="margin-left: 0.75rem;">Exit Quiz</button>';
  app.innerHTML = html;
  document.getElementById('start-quiz').addEventListener('click', startQuiz);
  document.getElementById('exit-to-topics').addEventListener('click', showTopics);
}

// Initialise quiz state and show the first question.
function startQuiz() {
  questionIndex = 0;
  score = 0;
  showQuestion();
}

// Render a single question. Then display the question text, a list of
// answer options, and navigation buttons.
function showQuestion() {
  const questions = currentQuiz.questions;
  // If we've exhausted the questions, jump to the score screen
  if (questionIndex >= questions.length) {
    showScore();
    return;
  }
  const q = questions[questionIndex];
  let html = `<h3>Question ${questionIndex + 1} of ${questions.length}</h3>`;
  html += `<p>${q.question}</p>`;
  html += '<div id="answers">';
  q.options.forEach(opt => {
    html += `<div class="answer-option" data-answer="${opt}">${opt}</div>`;
  });
  html += '</div>';
  html += '<button id="next-btn" disabled>Next</button>';
  html += '<button id="exit-btn" style="margin-left: 0.75rem;">Exit Quiz</button>';
  app.innerHTML = html;
  let selected = null;
  // When the user clicks an answer, mark it selected and enable Next
  document.querySelectorAll('.answer-option').forEach(optEl => {
    optEl.addEventListener('click', () => {
      document.querySelectorAll('.answer-option').forEach(el => el.classList.remove('selected'));
      optEl.classList.add('selected');
      selected = optEl.dataset.answer;
      document.getElementById('next-btn').disabled = false;
    });
  });
  // Next button evaluates the answer and advances
  document.getElementById('next-btn').addEventListener('click', () => {
    if (!selected) return;
    if (selected === q.answer) {
      score += 1;
    }
    questionIndex += 1;
    showQuestion();
  });
  // Exit button resets everything and returns to topics
  document.getElementById('exit-btn').addEventListener('click', showTopics);
}

// Show the final score along with the quiz title.
function showScore() {
  const total = currentQuiz.questions.length;
  let html = `<h2>Quiz Complete: ${currentQuiz.title}</h2>`;
  html += `<p><strong>Score: ${score} / ${total}</strong></p>`;
  html += '<button id="return-btn">Return to Topics</button>';
  app.innerHTML = html;
  document.getElementById('return-btn').addEventListener('click', showTopics);
}

// Start the DOM when it's ready
document.addEventListener('DOMContentLoaded', showTopics);
