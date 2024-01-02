const container = document.querySelector(".container");
const addQuestionCard = document.getElementById("add-question-card");
const cardButton = document.getElementById("save-btn");
const question = document.getElementById("question");
const answer = document.getElementById("answer");
const errorMessage = document.getElementById("error");
const addQuestion = document.getElementById("add-flashcard");
const closeBtn = document.getElementById("close-btn");
const flashcardContainer = document.querySelector('.card-list-container');
let editBool = false;
let currentCategory = getCategoryFromUrl();
let submitEdit;

function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category');
}

// Update UI to reflect current category
document.querySelector('#category-title').textContent = currentCategory;


//Add question when user clicks 'Add Flashcard' button
addQuestion.addEventListener("click", () => {
    container.classList.add("hide");
    question.value = "";
    answer.value = "";
    addQuestionCard.classList.remove("hide");
    errorMessage.textContent = ''; // Clear any error message
    errorMessage.classList.add("hide");
});

//Hide Create flashcard Card
closeBtn.addEventListener("click", () => {
    container.classList.remove("hide");
    addQuestionCard.classList.add("hide");
    errorMessage.textContent = ''; // Clear any error message
    errorMessage.classList.add("hide");
    if (editBool) {
        editBool = false;
        submitQuestion();
    }
});

cardButton.addEventListener("click", () => {
    let tempQuestion = question.value.trim();
    let tempAnswer = answer.value.trim();

    if (!tempQuestion || !tempAnswer) {
        errorMessage.textContent = 'Input fields cannot be empty!';
        errorMessage.classList.remove("hide");
        return; // Stop the function if fields are empty
    }

    if (editBool && editingFlashcardId) {
        // Editing an existing flashcard
        let flashcardData = {
            category: currentCategory,
            title: tempQuestion,
            answer: tempAnswer
        };

        fetch(`/updateFlashcard/${editingFlashcardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flashcardData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Find the flashcard in the DOM and update its content
                    let flashcardDiv = document.querySelector(`div[data-id="${editingFlashcardId}"]`);
                    if (flashcardDiv) {
                        flashcardDiv.querySelector(".question-div").textContent = tempQuestion;
                        flashcardDiv.querySelector(".answer-div").textContent = tempAnswer;
                    }
                    resetEditState();
                } else {
                    errorMessage.textContent = "Error updating flashcard. Please try again.";
                    errorMessage.classList.remove("hide");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = "Error updating flashcard. Please try again.";
                errorMessage.classList.remove("hide");
            });

    } else {
        // Adding a new flashcard
        let tempUserID = Math.floor(Math.random() * 10000) + 1;
        let flashcardData = {
            category: currentCategory,
            title: tempQuestion,
            answer: tempAnswer,
            userID: tempUserID
        };

        fetch('/addFlashcard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flashcardData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addFlashcardToUI(data.flashcard);
                    localStorage.setItem('updateCounts', 'true');
                    resetEditState();
                } else {
                    errorMessage.textContent = data.error || "Error saving flashcard. Please try again.";
                    errorMessage.classList.remove("hide");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = "Error saving flashcard. Please try again.";
                errorMessage.classList.remove("hide");
            });
    }
});

function resetEditState() {
    // Reset the form and hide the add/edit card UI
    question.value = "";
    answer.value = "";
    errorMessage.textContent = '';
    errorMessage.classList.add("hide");
    addQuestionCard.classList.add("hide");
    container.classList.remove("hide");
    // Reset editing flags
    editBool = false;
    editingFlashcardId = null;
    // Update the button text back to 'Save'
    cardButton.textContent = 'Save';
    // Reattach the original event listener for adding new flashcards
    cardButton.onclick = submitQuestion;
}


function submitQuestion() {
    let tempQuestion = question.value.trim();
    let tempAnswer = answer.value.trim();

    if (!tempQuestion || !tempAnswer) {
        // If fields are empty
        errorMessage.textContent = 'Input fields cannot be empty!';
        errorMessage.classList.remove("hide");
        return;
    }

    // Check for duplicate titles only when adding a new flashcard
    if (isDuplicateTitle(tempQuestion, editBool ? editingFlashcardId : null)) {
        errorMessage.textContent = 'A flashcard with this title already exists.';
        errorMessage.classList.remove("hide");
        return;
    }

    // Construct flashcard data
    let flashcardData = {
        category: currentCategory,
        title: tempQuestion,
        answer: tempAnswer,
        userID: tempUserID
    };


    let url = editBool ? `/updateFlashcard/${editingFlashcardId}` : '/addFlashcard';
    let method = editBool ? 'PUT' : 'POST';
    let headers = {
        'Content-Type': 'application/json',
    };
    let body = JSON.stringify(flashcardData);

    fetch(url, { method, headers, body })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (editBool) {
                    // Update the flashcard in the UI
                    updateFlashcardUI(editingFlashcardId, tempQuestion, tempAnswer);
                } else {
                    // Add the new flashcard to the UI
                    addFlashcardToUI(data.flashcard);
                }
                resetEditState(); // Reset the form state
                errorMessage.classList.add("hide");
            } else {
                // Handle errors like duplicate titles from the backend
                errorMessage.textContent = data.error || "Error saving flashcard. Please try again.";
                errorMessage.classList.remove("hide");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = "Error saving flashcard. Please try again.";
            errorMessage.classList.remove("hide");
        });
}


cardButton.addEventListener("click", submitQuestion);

// Helper function to update a flashcard in the UI
function updateFlashcardUI(id, question, answer) {
    let flashcardDiv = document.querySelector(`div[data-id="${id}"]`);
    if (flashcardDiv) {
        flashcardDiv.querySelector(".question-div").textContent = question;
        flashcardDiv.querySelector(".answer-div").textContent = answer;
    }
}


// Clear error message when the user starts typing in the question or answer fields
question.addEventListener('input', () => {
    if (errorMessage.textContent !== '') {
        errorMessage.textContent = '';
        errorMessage.classList.add("hide");
    }
});

answer.addEventListener('input', () => {
    if (errorMessage.textContent !== '') {
        errorMessage.textContent = '';
        errorMessage.classList.add("hide");
    }
});



function createViewForFlashcard(flashcard) {
    const div = document.createElement("div");
    div.classList.add("card");


    const questionText = flashcard.tit;
    const answerText = flashcard.Answer;

    div.dataset.id = flashcard.FlashcardID;

    div.innerHTML = `
        <div class="question-div">${questionText}</div>
        <p class="answer-div hide">${answerText}</p>
        <a href="#" class="show-hide-btn">Show answer / Hide answer</a>
        <div class="card-buttons">
            <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;


    const link = div.querySelector(".show-hide-btn");
    link.addEventListener("click", (e) => {
        e.preventDefault();
        div.querySelector(".answer-div").classList.toggle("hide");
    });

    const editButton = div.querySelector(".edit-btn");
    editButton.addEventListener("click", () => {
        editFlashcard(div);
    });

    const deleteButton = div.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
        deleteFlashcard(div.dataset.id);
    });

    return div;
}


// Function to validate if the flashcard title already exists (excluding the current editing one)
function isDuplicateTitle(title, excludeId) {
    const flashcards = document.querySelectorAll('.card');
    console.log("Checking for duplicates for title: ", title);

    for (let flashcard of flashcards) {
        let existingTitle = flashcard.querySelector(".question-div").textContent.trim().toLowerCase();
        console.log("Existing title: ", existingTitle);

        if (flashcard.dataset.id !== excludeId && existingTitle === title.toLowerCase()) {
            console.log("Duplicate found for title: ", title);
            return true; // Duplicate title found
        }
    }
    console.log("No duplicate found for title: ", title);
    return false; // No duplicate title found
}


let editingFlashcardId = null;

function editFlashcard(flashcardDiv) {
    const questionText = flashcardDiv.querySelector(".question-div").textContent;
    const answerText = flashcardDiv.querySelector(".answer-div").textContent;
    editingFlashcardId = flashcardDiv.dataset.id;


    question.value = questionText;
    answer.value = answerText;
    editBool = true; // Set edit mode to true
    addQuestionCard.classList.remove("hide");
    container.classList.add("hide");
    cardButton.textContent = 'Update Flashcard';


    submitEdit = function() {
        submitQuestion(true);
    };
    cardButton.removeEventListener('click', submitQuestion);
    cardButton.addEventListener('click', submitEdit);
}

function deleteFlashcard(flashcardId) {

    const modal = document.getElementById("deleteModal");
    const confirmDelete = document.getElementById("confirmDelete");
    const cancelDelete = document.getElementById("cancelDelete");
    const span = document.getElementsByClassName("close")[0];


    modal.style.display = "block";


    span.onclick = function() {
        modal.style.display = "none";
    }


    cancelDelete.onclick = function() {
        modal.style.display = "none";
    }


    confirmDelete.onclick = function() {
        fetch('/deleteFlashcard/' + flashcardId, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector(`div[data-id="${flashcardId}"]`)?.remove();
                    localStorage.setItem('updateCounts', 'true');
                    modal.style.display = "none";
                } else {
                    console.error('Error deleting flashcard:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

// Function to add a flashcard to the UI after it's created
function addFlashcardToUI(flashcardData) {
    const cardElement = createViewForFlashcard(flashcardData);
    flashcardContainer.appendChild(cardElement);
}


// Fetch and display flashcards for the current category
function fetchAndDisplayFlashcards() {
    fetch(`/getFlashcards?category=${encodeURIComponent(currentCategory)}`)
        .then(response => response.json())
        .then(flashcards => {
            console.log(flashcards);
            flashcardContainer.innerHTML = '';
            flashcards.forEach(flashcard => {
                const cardElement = createViewForFlashcard(flashcard);
                flashcardContainer.appendChild(cardElement);
            });
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
        });
}

// Call fetchAndDisplayFlashcards when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const categoryTitle = getCategoryFromUrl();
    if (categoryTitle) {
        document.getElementById('category-title').textContent = categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1);
        fetchAndDisplayFlashcards();
    }
});


document.getElementById('delete-all-flashcards').addEventListener('click', () => {

    const deleteAllModal = document.getElementById("deleteAllModal");
    const confirmDeleteAll = document.getElementById("confirmDeleteAll");
    const cancelDeleteAll = document.getElementById("cancelDeleteAll");
    const spanDeleteAllClose = document.querySelector(".delete-all-close");


    deleteAllModal.style.display = "block";


    spanDeleteAllClose.onclick = function() {
        deleteAllModal.style.display = "none";
    }


    cancelDeleteAll.onclick = function() {
        deleteAllModal.style.display = "none";
    }

    confirmDeleteAll.onclick = function() {
        fetch(`/deleteAllFlashcards?category=${encodeURIComponent(currentCategory)}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove all flashcards from the UI
                    while (flashcardContainer.firstChild) {
                        flashcardContainer.removeChild(flashcardContainer.firstChild);
                    }
                    deleteAllModal.style.display = "none"; // Close modal on success
                } else {
                    console.error('Error deleting all flashcards:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    window.onclick = function(event) {
        if (event.target === deleteAllModal) {
            deleteAllModal.style.display = "none";
        }
    }
});




