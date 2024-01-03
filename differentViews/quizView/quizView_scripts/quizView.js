// This event listener ensures that the JavaScript code will only run after the entire document has loaded.
document.addEventListener('DOMContentLoaded', function () {
    // Attaching an event listener to the 'Submit Quiz' button
    document.getElementById('submit-quiz').addEventListener('click', function() {
        submitQuiz();
    });

    // Function that loads quiz questions from the server
    function loadQuizQuestions() {
        fetch('/getQuizQuestions') // AJAX call to the server to get the quiz questions
            .then(response => response.json()) // Parsing the JSON response
            .then(questions => {
                // Reference to the quiz container element
                const quizContainer = document.getElementById('quiz-container');
                questions.forEach((question, index) => {
                    // Creating and appending question elements to the quiz container
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question';

                    const questionHeader = document.createElement('div');
                    questionHeader.className = 'question-header';
                    questionHeader.textContent = `Question ${index + 1}: ${question.flashcardTitle}`;

                    const questionInput = document.createElement('input');
                    questionInput.type = 'text';
                    questionInput.dataset.answer = question.answer; // Storing the correct answer

                    questionDiv.appendChild(questionHeader);
                    questionDiv.appendChild(questionInput);
                    quizContainer.appendChild(questionDiv);
                });
            })
            .catch(error => {
                // Logging any errors that occur during the fetch operation to the console
                console.error('Error fetching quiz questions:', error);
            });
    }

    // Invoke the function to load quiz questions once the DOM content has loaded
    loadQuizQuestions();
    // Function that handles the quiz submission logic
    function submitQuiz() {
        const questions = document.querySelectorAll('.question');
        let score = 0;
        questions.forEach(question => {
            const input = question.querySelector('input');
            // Checks if the provided answer matches the correct answer, ignoring case
            const isCorrect = input.dataset.answer.toLowerCase() === input.value.toLowerCase();
            if (isCorrect) {
                score++; // Increment score if the answer is correct
                question.style.color = 'green'; // Change text color to green for correct answers
            } else {
                question.style.color = 'red'; // Change text color to red for incorrect answers
            }
        });
        // Update the quiz result text with the user's score
        const resultDiv = document.getElementById('quiz-result');
        resultDiv.textContent = `You scored ${score} out of ${questions.length}`;
    }


});
