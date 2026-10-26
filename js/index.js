// ========================================
// 1. DOM ELEMENTS
// ========================================

const startQuizBtn = document.getElementById("startQuizBtn");

const welcomeScreen = document.getElementById("welcomeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");

const currentQuestion = document.getElementById("currentQuestion");
const totalQuestions = document.getElementById("totalQuestions");

const progressBar = document.getElementById("progressBar");

const timerElement = document.getElementById("timer");
const timerBox = document.querySelector(".timer-box");

const highScoreElement = document.getElementById("highScore");

const finalScoreElement = document.getElementById("finalScore");
const correctCountElement = document.getElementById("correctCount");
const wrongCountElement = document.getElementById("wrongCount");
const resultHighScoreElement = document.getElementById("resultHighScore");

const answerReviewContainer = document.getElementById("answerReview");

const restartQuizBtn = document.getElementById("restartQuizBtn");


// ========================================
// 2. QUIZ STATE
// ========================================

let questions = [];

let currentQuestionIndex = 0;

let score = 0;

let userAnswers = [];

let timeLeft = 20;

let timerInterval = null;

let isAnswerSubmitted = false;

const QUESTION_TIME = 20;
const MARKS_PER_QUESTION = 10;
const HIGH_SCORE_KEY = "prostutiHighScore";


// ========================================
// 3. SHUFFLE ARRAY
// ========================================

const shuffleArray = (array) => {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const randomIndex = Math.floor(
            Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[randomIndex]] =
            [shuffled[randomIndex], shuffled[i]];

    }

    return shuffled;
};


// ========================================
// 4. LOAD QUESTIONS FROM JSON
// ========================================

const loadQuestions = async () => {

    try {

        const response = await fetch("./data/questions.json");

        if (!response.ok) {
            throw new Error("Failed to load questions");
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No questions found");
        }

        // Shuffle questions and options
        questions = shuffleArray(data).map((question) => {

            return {
                ...question,
                options: shuffleArray(question.options)
            };

        });

    } catch (error) {

        console.error("Error:", error.message);

        questions = [];

        alert("Unable to load quiz questions!");

    }

};


// ========================================
// 5. START QUIZ
// ========================================

const startQuiz = async () => {

    startQuizBtn.disabled = true;

    clearInterval(timerInterval);

    await loadQuestions();

    if (questions.length === 0) {
        startQuizBtn.disabled = false;
        return;
    }

    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];

    timeLeft = QUESTION_TIME;
    isAnswerSubmitted = false;

    // Hide other screens
    welcomeScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    // Show quiz screen
    quizScreen.classList.remove("hidden");

    startQuizBtn.disabled = false;

    displayQuestion();

};


// ========================================
// 6. DISPLAY QUESTION
// ========================================

const displayQuestion = () => {

    isAnswerSubmitted = false;

    const question = questions[currentQuestionIndex];

    // Display question
    questionText.textContent = question.question;

    // Update question number
    currentQuestion.textContent = currentQuestionIndex + 1;

    totalQuestions.textContent = questions.length;

    // Clear previous options
    optionsContainer.innerHTML = "";

    // Create option buttons
    question.options.forEach((option, index) => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "option-btn";

        const optionLetter = String.fromCharCode(65 + index);

        button.textContent = `${optionLetter}. ${option}`;

        // Answer selection
        button.addEventListener("click", () => {
            selectAnswer(option);
        });

        optionsContainer.appendChild(button);

    });

    updateProgress();

    startTimer();

};


// ========================================
// 7. COUNTDOWN TIMER
// ========================================

const startTimer = () => {

    clearInterval(timerInterval);

    timeLeft = QUESTION_TIME;

    timerElement.textContent = timeLeft;

    timerBox.classList.remove("warning");

    timerInterval = setInterval(() => {

        timeLeft--;

        timerElement.textContent = timeLeft;

        // Timer warning
        if (timeLeft <= 5) {
            timerBox.classList.add("warning");
        }

        // Time over
        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            selectAnswer(null);

        }

    }, 1000);

};


// ========================================
// 8. SELECT ANSWER
// ========================================

const selectAnswer = (selectedOption) => {

    // Prevent duplicate submissions
    if (isAnswerSubmitted) {
        return;
    }

    isAnswerSubmitted = true;

    // Stop timer
    clearInterval(timerInterval);

    const question = questions[currentQuestionIndex];

    // Check answer
    const isCorrect = selectedOption === question.correctAnswer;

    // Update score
    if (isCorrect) {
        score += MARKS_PER_QUESTION;
    }

    // Store user's answer
    userAnswers.push({

        questionId: question.id,

        question: question.question,

        selectedAnswer: selectedOption,

        correctAnswer: question.correctAnswer,

        isCorrect: isCorrect

    });

    // Move to next question
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {

        displayQuestion();

    } else {

        showResult();

    }

};


// ========================================
// 9. UPDATE PROGRESS BAR
// ========================================

const updateProgress = () => {

    const progress = (
        currentQuestionIndex / questions.length
    ) * 100;

    progressBar.style.width = `${progress}%`;

};


// ========================================
// 10. SHOW RESULT
// ========================================

const showResult = () => {

    clearInterval(timerInterval);

    // Complete progress
    progressBar.style.width = "100%";

    // Hide quiz screen
    quizScreen.classList.add("hidden");

    // Show result screen
    resultScreen.classList.remove("hidden");

    // Calculate results
    const correctAnswers = userAnswers.filter(
        (answer) => answer.isCorrect
    ).length;

    const wrongAnswers = userAnswers.filter(
        (answer) => !answer.isCorrect
    ).length;

    // Display result
    finalScoreElement.textContent =
        `${score}/${questions.length * MARKS_PER_QUESTION}`;

    correctCountElement.textContent = correctAnswers;

    wrongCountElement.textContent = wrongAnswers;

    // Save high score
    saveHighScore();

    // Show answer review
    displayAnswerReview();

};


// ========================================
// 11. ANSWER REVIEW
// ========================================

const displayAnswerReview = () => {

    answerReviewContainer.innerHTML = "";

    userAnswers.forEach((answer, index) => {

        const reviewCard = document.createElement("div");

        reviewCard.className = answer.isCorrect
            ? "review-card correct"
            : "review-card wrong";

        // Question title
        const title = document.createElement("h3");

        title.textContent = `Q${index + 1}. ${answer.question}`;

        reviewCard.appendChild(title);

        // User's answer
        const userAnswerText = document.createElement("p");

        userAnswerText.textContent = answer.selectedAnswer === null
            ? "Your Answer: Time Out"
            : `Your Answer: ${answer.selectedAnswer}`;

        userAnswerText.className = answer.isCorrect
            ? "correct-text"
            : "wrong-text";

        reviewCard.appendChild(userAnswerText);

        // Correct answer
        const correctAnswerText = document.createElement("p");

        correctAnswerText.textContent =
            `Correct Answer: ${answer.correctAnswer}`;

        correctAnswerText.className = "correct-text";

        reviewCard.appendChild(correctAnswerText);

        answerReviewContainer.appendChild(reviewCard);

    });

};


// ========================================
// 12. SAVE HIGH SCORE
// ========================================

const saveHighScore = () => {

    const previousHighScore = Number(
        localStorage.getItem(HIGH_SCORE_KEY)
    ) || 0;

    if (score > previousHighScore) {

        localStorage.setItem(HIGH_SCORE_KEY, score);

    }

    displayHighScore();

};


// ========================================
// 13. DISPLAY HIGH SCORE
// ========================================

const displayHighScore = () => {

    const highScore = Number(
        localStorage.getItem(HIGH_SCORE_KEY)
    ) || 0;

    highScoreElement.textContent = highScore;

    resultHighScoreElement.textContent = highScore;

};


// ========================================
// 14. RESTART QUIZ
// ========================================

const restartQuiz = () => {

    clearInterval(timerInterval);

    // Reset quiz state
    questions = [];

    currentQuestionIndex = 0;

    score = 0;

    userAnswers = [];

    timeLeft = QUESTION_TIME;

    isAnswerSubmitted = false;

    progressBar.style.width = "0%";

    // Hide result
    resultScreen.classList.add("hidden");

    // Show welcome screen
    welcomeScreen.classList.remove("hidden");

    // Update high score
    displayHighScore();

};


// ========================================
// 15. EVENT LISTENERS
// ========================================

startQuizBtn.addEventListener("click", startQuiz);

restartQuizBtn.addEventListener("click", restartQuiz);


// ========================================
// 16. INITIALIZE APP
// ========================================

displayHighScore();