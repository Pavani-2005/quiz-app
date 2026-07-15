// ============================================
// SUBJECT → Open Trivia DB API CATEGORY MAPPING
// API Reference: https://opentdb.com/api_config.php
// ============================================
const API_BASE = "https://opentdb.com/api.php";

const subjects = {
    English:   { icon: "📖", desc: "Grammar, Vocabulary, Literature",  apiCategory: null },       // No specific category → random
    Maths:     { icon: "📐", desc: "Numbers, Algebra, Geometry",       apiCategory: 19 },         // Science: Mathematics
    Social:    { icon: "🌍", desc: "Geography & Civics",               apiCategory: 22 },         // Geography
    GK:        { icon: "🧠", desc: "General Knowledge & Facts",        apiCategory: 9 },          // General Knowledge
    Science:   { icon: "🔬", desc: "Physics, Chemistry, Biology",      apiCategory: 17 },         // Science & Nature
    Physics:   { icon: "⚡", desc: "Forces, Motion, Energy",           apiCategory: 17 },         // Science & Nature
    Biology:   { icon: "🧬", desc: "Life, Cells, Human Body",          apiCategory: 27 },         // Animals (closest to biology)
    History:   { icon: "📜", desc: "World & Indian History",            apiCategory: 23 },         // History
    Reasoning: { icon: "🧩", desc: "Patterns, Logic, Puzzles",         apiCategory: null },       // Random → general logic
    Aptitude:  { icon: "📊", desc: "Maths Aptitude, Problem Solving",  apiCategory: 19 },         // Science: Mathematics
    Geography: { icon: "🗺️", desc: "Countries, Capitals, Rivers",      apiCategory: 22 },         // Geography
    Politics:  { icon: "🏛️", desc: "Civics & Political Science",      apiCategory: 24 },         // Politics
    Art:       { icon: "🎨", desc: "Art & Culture",                    apiCategory: 25 },         // Art
    Sports:    { icon: "⚽", desc: "Sports & Games",                   apiCategory: 21 },         // Sports
};

// Map class → difficulty for the API
function getDifficulty(classNum) {
    if (classNum <= 7) return "easy";
    if (classNum <= 9) return "medium";
    return "hard";
}

// ============================================
// GAME STATE
// ============================================
let playerName = "";
let selectedClass = null;
let selectedSubject = null;
let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let answers = [];
let timer = null;
let timeLeft = 30;
const TIME_PER_QUESTION = 30;

// ============================================
// DOM ELEMENTS
// ============================================
const welcomeScreen   = document.getElementById("welcomeScreen");
const classScreen     = document.getElementById("classScreen");
const subjectScreen   = document.getElementById("subjectScreen");
const loadingScreen   = document.getElementById("loadingScreen");
const quizScreen      = document.getElementById("quizScreen");
const resultScreen    = document.getElementById("resultScreen");

const playerNameInput = document.getElementById("playerName");
const nextToClassBtn  = document.getElementById("nextToClassBtn");
const selectedPlayerName = document.getElementById("selectedPlayerName");
const classGrid       = document.getElementById("classGrid");
const subjectGrid     = document.getElementById("subjectGrid");
const selectedClassTitle = document.getElementById("selectedClassTitle");
const backToClassBtn  = document.getElementById("backToClassBtn");
const loadingText     = document.getElementById("loadingText");
const loadingSubtext  = document.getElementById("loadingSubtext");

const navClass        = document.getElementById("navClass");
const navSubject      = document.getElementById("navSubject");
const liveScore       = document.getElementById("liveScore");
const liveTimer       = document.getElementById("liveTimer");
const timerDisplay    = document.getElementById("timerDisplay");

const questionText    = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const questionCounter = document.getElementById("questionCounter");
const categoryBadge   = document.getElementById("categoryBadge");
const progressBar     = document.getElementById("progressBar");
const feedbackBox     = document.getElementById("feedbackBox");
const feedbackIcon    = document.getElementById("feedbackIcon");
const feedbackText    = document.getElementById("feedbackText");
const prevBtn         = document.getElementById("prevBtn");
const nextBtn         = document.getElementById("nextBtn");

const finalScore      = document.getElementById("finalScore");
const scoreTotal      = document.getElementById("scoreTotal");
const correctCount    = document.getElementById("correctCount");
const wrongCount      = document.getElementById("wrongCount");
const skippedCount    = document.getElementById("skippedCount");
const resultTitle     = document.getElementById("resultTitle");
const resultSubtitle  = document.getElementById("resultSubtitle");
const resultEmoji     = document.getElementById("resultEmoji");
const resultDetail    = document.getElementById("resultDetail");
const scoreRing       = document.getElementById("scoreRing");
const retryBtn        = document.getElementById("retryBtn");
const changeSubjectBtn = document.getElementById("changeSubjectBtn");
const homeBtn         = document.getElementById("homeBtn");

// ============================================
// SCREEN MANAGEMENT
// ============================================
function showScreen(screen) {
    [welcomeScreen, classScreen, subjectScreen, loadingScreen, quizScreen, resultScreen]
        .forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
    window.scrollTo(0, 0);
}

function showNavInfo(show) {
    navClass.style.display = show ? "inline-block" : "none";
    navSubject.style.display = show ? "inline-block" : "none";
    liveScore.style.display = show ? "inline-block" : "none";
    liveTimer.style.display = show ? "inline-block" : "none";
}

// ============================================
// DECODE HTML ENTITIES (API returns &quot; etc.)
// ============================================
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// ============================================
// WELCOME SCREEN
// ============================================
playerNameInput.addEventListener("input", function () {
    nextToClassBtn.disabled = this.value.trim().length === 0;
});
playerNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && this.value.trim().length > 0) goToClassSelection();
});
nextToClassBtn.addEventListener("click", goToClassSelection);

function goToClassSelection() {
    playerName = playerNameInput.value.trim();
    selectedPlayerName.textContent = `Welcome, ${playerName}! Choose your class:`;
    showScreen(classScreen);
}

// ============================================
// CLASS SELECTION
// ============================================
classGrid.addEventListener("click", function (e) {
    const btn = e.target.closest(".class-btn");
    if (!btn) return;
    selectedClass = parseInt(btn.getAttribute("data-class"));
    goToSubjectSelection();
});

function goToSubjectSelection() {
    selectedClassTitle.textContent = `Class ${selectedClass}`;
    navClass.textContent = `Class ${selectedClass}`;

    subjectGrid.innerHTML = "";
    Object.keys(subjects).forEach(sub => {
        const s = subjects[sub];
        const col = document.createElement("div");
        col.className = "col-md-4 col-sm-6";
        col.innerHTML = `
            <button class="subject-btn" data-subject="${sub}">
                <span class="subject-icon">${s.icon}</span>
                <span class="subject-info">
                    <span class="subject-name">${sub}</span>
                    <span class="subject-desc">${s.desc}</span>
                </span>
            </button>
        `;
        subjectGrid.appendChild(col);
    });
    showScreen(subjectScreen);
}

backToClassBtn.addEventListener("click", function () {
    showScreen(classScreen);
});

// ============================================
// SUBJECT SELECTION → FETCH QUESTIONS FROM API
// ============================================
subjectGrid.addEventListener("click", function (e) {
    const btn = e.target.closest(".subject-btn");
    if (!btn) return;
    selectedSubject = btn.getAttribute("data-subject");
    fetchQuestionsFromAPI();
});

async function fetchQuestionsFromAPI() {
    const subjectData = subjects[selectedSubject];
    const difficulty = getDifficulty(selectedClass);
    const amount = 10;

    // Build API URL
    let url = `${API_BASE}?amount=${amount}&difficulty=${difficulty}&type=multiple`;
    if (subjectData.apiCategory !== null) {
        url += `&category=${subjectData.apiCategory}`;
    }

    // Show loading screen
    loadingText.textContent = `Fetching ${selectedSubject} questions...`;
    loadingSubtext.textContent = `Class ${selectedClass} | Difficulty: ${difficulty} | Source: opentdb.com`;
    showScreen(loadingScreen);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.response_code !== 0 || !data.results || data.results.length === 0) {
            // API returned no questions for this combo → try without category
            loadingSubtext.textContent = "Retrying with random questions...";
            const retryUrl = `${API_BASE}?amount=${amount}&difficulty=${difficulty}&type=multiple`;
            const retryResponse = await fetch(retryUrl);
            const retryData = await retryResponse.json();

            if (retryData.response_code !== 0 || !retryData.results || retryData.results.length === 0) {
                showError("Could not fetch questions. Please check your internet connection and try again.");
                return;
            }
            processQuestions(retryData.results);
            return;
        }

        processQuestions(data.results);

    } catch (error) {
        console.error("API Error:", error);
        showError("Network error! Please check your internet connection and try again.");
    }
}

function processQuestions(apiResults) {
    // Convert API format to our internal format
    currentQuestions = apiResults.map(q => ({
        q: decodeHTML(q.question),
        options: shuffleArray([
            decodeHTML(q.correct_answer),
            ...q.incorrect_answers.map(a => decodeHTML(a))
        ]),
        correct: 0, // will find correct index after shuffle
        category: decodeHTML(q.category),
        difficulty: q.difficulty
    }));

    // Find correct answer index for each question (after shuffle)
    currentQuestions.forEach((cq, i) => {
        const correctAnswer = decodeHTML(apiResults[i].correct_answer);
        cq.correct = cq.options.indexOf(correctAnswer);
    });

    startQuiz();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showError(msg) {
    // Go back to subject screen with an alert
    showScreen(subjectScreen);
    alert(msg);
}

// ============================================
// START QUIZ
// ============================================
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answers = new Array(currentQuestions.length).fill(-1);

    navSubject.textContent = selectedSubject;
    liveScore.textContent = "Score: 0";
    showNavInfo(true);
    progressBar.style.background = "linear-gradient(90deg, #667eea, #764ba2)";

    showScreen(quizScreen);
    loadQuestion();
}

// ============================================
// LOAD QUESTION
// ============================================
function loadQuestion() {
    const q = currentQuestions[currentQuestion];

    questionCounter.textContent = `Question ${currentQuestion + 1}/${currentQuestions.length}`;
    categoryBadge.textContent = `${subjects[selectedSubject].icon} ${q.category || selectedSubject}`;
    progressBar.style.width = `${((currentQuestion + 1) / currentQuestions.length) * 100}%`;
    questionText.textContent = q.q;

    const optionLetters = ["A", "B", "C", "D"];
    const optionButtons = optionsContainer.querySelectorAll(".option-btn");

    optionButtons.forEach((btn, index) => {
        btn.querySelector(".option-text").textContent = q.options[index];
        btn.querySelector(".option-letter").textContent = optionLetters[index];
        btn.className = "option-btn btn w-100 text-start mb-3 p-3";
        btn.disabled = false;

        if (answers[currentQuestion] !== -1) {
            btn.disabled = true;
            if (index === q.correct) {
                btn.classList.add("correct");
            } else if (index === answers[currentQuestion] && index !== q.correct) {
                btn.classList.add("wrong");
            } else {
                btn.classList.add("disabled");
            }
        }
    });

    if (answers[currentQuestion] !== -1) {
        const type = answers[currentQuestion] === q.correct ? "correct" :
                     answers[currentQuestion] === -2 ? "timeout" : "wrong";
        showFeedback(type, q);
    } else {
        feedbackBox.className = "feedback-box";
    }

    prevBtn.disabled = currentQuestion === 0;
    nextBtn.innerHTML = currentQuestion === currentQuestions.length - 1 ? "Finish &#10003;" : "Next &#8594;";

    startTimer();

    const questionCard = document.querySelector(".question-card");
    questionCard.style.animation = "none";
    questionCard.offsetHeight;
    questionCard.style.animation = "slideIn 0.4s ease";
}

// ============================================
// TIMER
// ============================================
function startTimer() {
    clearInterval(timer);
    timeLeft = TIME_PER_QUESTION;
    updateTimerDisplay();

    timer = setInterval(function () {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 5) {
            liveTimer.classList.add("timer-warning");
        } else {
            liveTimer.classList.remove("timer-warning");
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerDisplay.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function handleTimeout() {
    if (answers[currentQuestion] !== -1) return;
    answers[currentQuestion] = -2;

    const q = currentQuestions[currentQuestion];
    const optionButtons = optionsContainer.querySelectorAll(".option-btn");
    optionButtons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === q.correct) {
            btn.classList.add("correct");
        } else {
            btn.classList.add("disabled");
        }
    });
    showFeedback("timeout", q);
}

// ============================================
// OPTION CLICK
// ============================================
optionsContainer.addEventListener("click", function (e) {
    const btn = e.target.closest(".option-btn");
    if (!btn || btn.disabled) return;
    if (answers[currentQuestion] !== -1) return;

    clearInterval(timer);
    liveTimer.classList.remove("timer-warning");

    const selectedIndex = parseInt(btn.getAttribute("data-index"));
    answers[currentQuestion] = selectedIndex;
    const q = currentQuestions[currentQuestion];
    const isCorrect = selectedIndex === q.correct;

    if (isCorrect) {
        score += 10;
        liveScore.textContent = `Score: ${score}`;
    }

    const optionButtons = optionsContainer.querySelectorAll(".option-btn");
    optionButtons.forEach((b, index) => {
        b.disabled = true;
        if (index === q.correct) {
            b.classList.add("correct");
        } else if (index === selectedIndex && !isCorrect) {
            b.classList.add("wrong");
        } else {
            b.classList.add("disabled");
        }
    });

    showFeedback(isCorrect ? "correct" : "wrong", q);
});

// ============================================
// FEEDBACK
// ============================================
function showFeedback(type, q) {
    feedbackBox.className = "feedback-box show " + type;
    if (type === "correct") {
        feedbackIcon.textContent = "✅";
        feedbackText.textContent = "Correct! Well done!";
    } else if (type === "wrong") {
        feedbackIcon.textContent = "❌";
        feedbackText.textContent = `Wrong! Correct answer: ${q.options[q.correct]}`;
    } else {
        feedbackIcon.textContent = "⏰";
        feedbackText.textContent = `Time's up! Correct answer: ${q.options[q.correct]}`;
    }
}

// ============================================
// NEXT / PREVIOUS
// ============================================
nextBtn.addEventListener("click", function () {
    if (currentQuestion < currentQuestions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        finishQuiz();
    }
});

prevBtn.addEventListener("click", function () {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
});

// ============================================
// FINISH QUIZ
// ============================================
function finishQuiz() {
    clearInterval(timer);
    liveTimer.classList.remove("timer-warning");
    showNavInfo(false);

    let correct = 0, wrong = 0, skipped = 0;
    for (let i = 0; i < currentQuestions.length; i++) {
        if (answers[i] === -1 || answers[i] === -2) {
            skipped++;
        } else if (answers[i] === currentQuestions[i].correct) {
            correct++;
        } else {
            wrong++;
        }
    }

    const total = currentQuestions.length;
    const percentage = (correct / total) * 100;

    finalScore.textContent = correct;
    scoreTotal.textContent = `/${total}`;
    correctCount.textContent = correct;
    wrongCount.textContent = wrong;
    skippedCount.textContent = skipped;
    resultDetail.textContent = `${playerName} | Class ${selectedClass} | ${selectedSubject} | Difficulty: ${getDifficulty(selectedClass)}`;

    if (percentage >= 80) {
        resultEmoji.textContent = "🏆";
        resultTitle.textContent = "Excellent!";
        resultSubtitle.textContent = "You're a quiz champion!";
    } else if (percentage >= 60) {
        resultEmoji.textContent = "🌟";
        resultTitle.textContent = "Great Job!";
        resultSubtitle.textContent = "You did really well!";
    } else if (percentage >= 40) {
        resultEmoji.textContent = "👍";
        resultTitle.textContent = "Good Effort!";
        resultSubtitle.textContent = "Keep learning and improving!";
    } else {
        resultEmoji.textContent = "📚";
        resultTitle.textContent = "Keep Trying!";
        resultSubtitle.textContent = "Practice makes perfect!";
    }

    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentage / 100) * circumference;
    scoreRing.style.strokeDashoffset = offset;

    if (percentage >= 80) scoreRing.style.stroke = "#28a745";
    else if (percentage >= 60) scoreRing.style.stroke = "#667eea";
    else if (percentage >= 40) scoreRing.style.stroke = "#ffc107";
    else scoreRing.style.stroke = "#dc3545";

    showScreen(resultScreen);
}

// ============================================
// RETRY / CHANGE SUBJECT / HOME
// ============================================
retryBtn.addEventListener("click", function () {
    resultScreen.classList.remove("active");
    fetchQuestionsFromAPI();
});

changeSubjectBtn.addEventListener("click", function () {
    resultScreen.classList.remove("active");
    showScreen(subjectScreen);
});

homeBtn.addEventListener("click", goHome);

function goHome() {
    clearInterval(timer);
    liveTimer.classList.remove("timer-warning");
    showNavInfo(false);
    scoreRing.style.strokeDashoffset = 339.292;
    showScreen(welcomeScreen);
}
