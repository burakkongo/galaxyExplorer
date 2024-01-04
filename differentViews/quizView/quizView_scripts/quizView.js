// This event listener ensures that the JavaScript code will only run after the entire document has loaded.
document.addEventListener('DOMContentLoaded', function () {
    // Attaching an event listener to the 'Submit Quiz' button
    document.getElementById('submit-quiz').addEventListener('click', function() {
        submitQuiz();
    });

    // Logout button

    document.getElementById('exitButton').addEventListener('click', function() {
            // Navigate to the registration.html page
            window.location.href = '/dashboard';
        });

        function fetchAndDisplayUserID() {
        fetch('/getUserID')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was NOT ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.username && data.userID) {
                    alert(`Username: ${data.username}, User ID: ${data.userID}`); // Alerting with username and userID
                    // Optionally display the username in the header if you want
                    document.getElementById('container').querySelector('h1').textContent = `Welcome to the Flashcard Quiz, ${data.username}!`;
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }
    fetchAndDisplayUserID();

    // Loads quiz questions from the server
    function loadQuizQuestions() {
        fetch('/getQuizQuestions')
            .then(response => response.json())
            .then(questions => {
                const quizContainer = document.getElementById('quiz-container');
                questions.forEach((question, index) => {
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
                console.error('Error fetching quiz questions:', error);
            });
    }
    loadQuizQuestions();

    // Submit Quiz
    // Check if score is = 5. If 5, add XP to user entry in DB
    function submitQuiz() {
        const questions = document.querySelectorAll('.question');
        let score = 0;
        questions.forEach(question => {
            const input = question.querySelector('input');
            const isCorrect = input.dataset.answer.toLowerCase() === input.value.toLowerCase();
            if (isCorrect) {
                score++;
                question.style.color = 'green';
            } else {
                question.style.color = 'red';
            }
        });

        const resultDiv = document.getElementById('quiz-result');
        resultDiv.textContent = `You scored ${score} out of ${questions.length}`;

        // Check if the score is 5 before updating userXP
        if (score === 5) {
            fetch('/updateUserXP', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    alert("You answered all questions right. You get Experience!");
                    console.log(data.message); // Log the response message
                })
                .catch(error => console.error('Error updating userXP:', error));
        } else {
            console.log('Score less than 5, not updating userXP');
        }
    }

});
