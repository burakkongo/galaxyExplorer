document.addEventListener('DOMContentLoaded', function () {
    const submitQuizButton = document.getElementById('submit-quiz');
    if (submitQuizButton) {
        submitQuizButton.style.fontFamily = 'Montserrat, sans-serif';
        submitQuizButton.style.backgroundColor = '#62D2A2';
        submitQuizButton.style.fontSize = '16px';
        submitQuizButton.style.borderRadius = '8px';
        submitQuizButton.style.color = '#ffffff';
        submitQuizButton.style.width = '150px';
        submitQuizButton.style.height = '40px';
        submitQuizButton.style.marginTop = '20px';
}
    document.getElementById('exit-quiz').addEventListener('click', function () {
        window.location.href = '/dashboard';
    });

    function displayCurrentQuizOnly() {
        document.getElementById('exit-quiz').addEventListener('click', function () {
            window.location.href = '/quizView';
        });
        document.getElementById('quiz-list-container').style.display = 'none';
        document.getElementById('custom-quiz-generator').style.display = 'none';
        document.getElementById('submit-quiz').style.display = 'block';
    }

    function handleQuizSubmission(score, questionsLength) {
        const resultText = `You scored ${score} out of ${questionsLength}`;
        alert(resultText);

        const resultDiv = document.getElementById('quiz-result');
        resultDiv.textContent = resultText;

        const exitQuizButton = document.getElementById('exit-quiz');
        exitQuizButton.addEventListener('click', function () {
            window.location.href = '/quizView';
        });

        resultDiv.appendChild(exitQuizButton);

        if (score === 5) {
            fetch('/updateUserXP', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({score})
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("You answered all questions right. You get Experience!");
                        console.log(data.message);
                    } else {
                        alert("There was a problem updating your experience points.");
                    }
                })
                .catch(error => console.error('Error updating userXP:', error));
        } else {
            console.log('Score less than 5, not updating userXP');
        }
    }

    document.getElementById('submit-quiz').addEventListener('click', submitQuiz);

    function fetchAndDisplayUserID() {
        fetch('/getUserID')
            .then(response => response.json())
            .then(data => {
                const welcomeText = document.querySelector('h1');

                const username = data.username ? data.username : 'User';
                welcomeText.textContent = `Welcome ${username}!`;
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                const welcomeText = document.querySelector('h1');
                welcomeText.textContent = "Welcome!";
            });
    }

    fetchAndDisplayUserID();
    loadUserQuizzes();

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
        handleQuizSubmission(score, questions.length);
    }

    function loadCategories() {
        const categories = ['Biology', 'Chemistry', 'Geography', 'History', 'Mathematics', 'Programming'];
        const categoriesPlaceholder = document.getElementById('categories-placeholder');
        categories.forEach(category => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'category';
            checkbox.value = category;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(category));
            categoriesPlaceholder.appendChild(label);
        });
    }

    loadCategories();

    document.getElementById('custom-quiz-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const quizName = document.getElementById('quiz-name').value;
        const questionCount = 5;
        const selectedCategories = Array.from(document.querySelectorAll('#categories-placeholder input:checked')).map(checkbox => checkbox.value);

        if (selectedCategories.length === 0) {
            alert('Please select at least one category.');
            return;
        }

        createCustomQuiz(quizName, questionCount, selectedCategories);
    });

    function createCustomQuiz(quizName, questionCount, categories) {
        fetch('/checkQuestionsCount', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({categories})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.count >= questionCount) {

                    return fetch('/createCustomQuiz', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({quizName, questionCount, categories})
                    });
                } else {

                    alert("Not enough questions in chosen categories.");
                    throw new Error("Not enough questions");
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newQuiz = {
                        QuizID: data.quiz.quizID,
                        Title: quizName,
                    };
                    displayQuiz(newQuiz);
                    document.getElementById('quiz-name').value = '';
                } else {
                    alert('Failed to create custom quiz');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    function deleteQuiz(quizID) {
        fetch(`/deleteQuiz/${quizID}`, {method: 'DELETE'})
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Quiz deleted successfully.');

                    loadUserQuizzes();
                } else {
                    alert('Failed to delete quiz.');
                }
            })
            .catch(error => {
                console.error('Error deleting quiz:', error);
            });
    }

    function loadUserQuizzes() {
        fetch('/getUserQuizzes')
            .then(response => response.json())
            .then(quizzes => {
                const quizListContainer = document.getElementById('quiz-list-container');
                quizListContainer.innerHTML = '';
                quizzes.forEach(quiz => {
                    displayQuiz(quiz);
                });
            })
            .catch(error => {
                console.error('Error loading quizzes:', error);
            });
    }


    function displayQuiz(quiz) {
        const quizListContainer = document.getElementById('quiz-list-container');

        // Ensure the quizListContainer will wrap its children in a flex container layout
        quizListContainer.className = 'quiz-list-flexbox';

        // Create a container for each quiz
        const quizDiv = document.createElement('div');
        quizDiv.className = 'quiz-entry';

        quizDiv.style.color = '#5C06B3';
        quizDiv.style.textAlign = 'center';
        quizDiv.style.fontFamily = 'font-family: "Poppins", sans-serif';


        // Title of the quiz
        const quizTitle = document.createElement('h3');
        quizTitle.textContent = quiz.Title || 'No title';
        quizDiv.appendChild(quizTitle);

        // Load Quiz Button
        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load Quiz';
        loadButton.style.fontFamily = 'Poppins, sans-serif';
        loadButton.style.backgroundColor = '#6389D1';
        loadButton.style.borderRadius = '7px';
        loadButton.style.fontSize = '12px';
        loadButton.style.color = 'white';
        loadButton.style.width = '120px';
        loadButton.style.height = '30px';

        loadButton.onclick = function () {
            displayCurrentQuizOnly();
            loadQuizQuestions(quiz.QuizID);
        };
        quizDiv.appendChild(loadButton);


        // Delete Quiz Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Quiz';
        deleteButton.style.fontFamily = 'Poppins, sans-serif';
        deleteButton.style.backgroundColor = '#ff4d4d';
        deleteButton.style.fontSize = '12px';
        deleteButton.style.borderRadius = '7px';
        deleteButton.style.color = 'white';
        deleteButton.style.width = '120px';
        deleteButton.style.height = '30px';

        deleteButton.onclick = function () {
            if (confirm('Are you sure you want to delete this quiz?')) {
                deleteQuiz(quiz.QuizID);
            }
        };
        quizDiv.appendChild(deleteButton);

        // Append the new quiz container to the quiz list
        quizListContainer.appendChild(quizDiv);
    }




    function loadQuizQuestions(quizID) {
        fetch(`/getQuestions/${quizID}`)
            .then(response => response.json())
            .then(questions => {
                console.log('Questions received:', questions);
                const quizContainer = document.getElementById('quiz-container');
                quizContainer.innerHTML = '';
                questions.forEach((question, index) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question';

                    questionDiv.style.fontSize = '18px'; // Schriftgröße
                    questionDiv.style.color = '#333333'; // Textfarbe
                    questionDiv.style.marginBottom = '30px'; // Abstand nach unten
                    questionDiv.style.padding = '10px'; // Innenabstand
                    questionDiv.style.color = '#ffffff';

                    const questionHeader = document.createElement('div');
                    questionHeader.className = 'question-header';
                    questionHeader.textContent = `Question ${index + 1}: ${question.flashcardTitle}`;

                    const questionInput = document.createElement('input');
                    questionInput.type = 'text';
                    questionInput.dataset.answer = question.answer;

                    questionInput.style.width = '100%'; // Breite des Eingabefelds
                    questionInput.style.padding = '10px'; // Innenabstand
                    questionInput.style.marginTop = '5px'; // Abstand nach oben
                    questionInput.style.borderRadius = '5px'; // Abgerundete Ecken

                    questionDiv.appendChild(questionHeader);
                    questionDiv.appendChild(questionInput);
                    quizContainer.appendChild(questionDiv);
                });
            })
            .catch(error => {
                console.error('Error fetching quiz questions:', error);
            });
    }
});
