const container = document.querySelector(".container");
const addQuestionCard = document.getElementById("add-question-card");
const cardButton = document.getElementById("save-btn");
const flashcardTitle = document.getElementById("flashcardTitle");
const answer = document.getElementById("answer");
const errorMessage = document.getElementById("error");
const addQuestion = document.getElementById("add-flashcard");
const closeBtn = document.getElementById("close-btn");
const flashcardContainer = document.querySelector('.card-list-container');
let editBool = false;
let currentCategory = getCategoryFromUrl();
let editingFlashcardId = null;
let submitEdit;

function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category');
}

// back to dashboard function
document.getElementById('back-to-dashboard').addEventListener('click', function () {
    // Navigate to the dashboard.html page
    window.location.href = '/dashboard';
});

// Set the category title
document.addEventListener('DOMContentLoaded', () => {
    const categoryTitle = getCategoryFromUrl();
    if (categoryTitle) {
        document.getElementById('category-title').textContent = categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1);
        refreshFlashcards();
    }
});

// Update UI to reflect current category
document.querySelector('#category-title').textContent = currentCategory;

//Add question when user clicks 'Add Flashcard' button
addQuestion.addEventListener("click", () => {
    container.classList.add("hide");
    flashcardTitle.value = "";
    answer.value = "";
    addQuestionCard.classList.remove("hide");
    errorMessage.textContent = '';
    errorMessage.classList.add("hide");
    editBool = false; // Ensure we are in 'add' mode
    editingFlashcardId = null;
});

//Hide Create flashcard Card
closeBtn.addEventListener("click", () => {
    resetEditState();
});

// Reset the state of the form and UI
function resetEditState() {
    flashcardTitle.value = "";
    answer.value = "";
    errorMessage.textContent = '';
    errorMessage.classList.add("hide");
    addQuestionCard.classList.add("hide");
    container.classList.remove("hide");
    editBool = false;
    editingFlashcardId = null;
    cardButton.textContent = 'Save';
}

// Event listener for the Save button
cardButton.addEventListener("click", submitQuestion);

function refreshFlashcards() {
    fetch(`/getFlashcards?category=${encodeURIComponent(currentCategory)}`)
        .then(response => response.json())
        .then(flashcards => {
            flashcardContainer.innerHTML = ''; // Clear existing flashcards
            flashcards.forEach(flashcard => {
                const cardElement = createViewForFlashcard(flashcard);
                flashcardContainer.appendChild(cardElement);
            });
        })
        .catch(error => console.error('Error fetching flashcards:', error));
}


// Function to submit a new or updated flashcard
function submitQuestion() {
    const tempQuestion = flashcardTitle.value.trim();
    const tempAnswer = answer.value.trim();

    // Log
    console.log("Question: ", tempQuestion, "Answer: ", tempAnswer);

    if (!tempQuestion || !tempAnswer) {
        errorMessage.textContent = 'Input fields cannot be empty!';
        errorMessage.classList.remove("hide");
        return;
    }

    if (isDuplicateTitle(tempQuestion, editingFlashcardId)) {
        errorMessage.textContent = 'A flashcard with this title already exists.';
        errorMessage.classList.remove("hide");
        return;
    }

    const flashcardData = {
        category: currentCategory,
        flashcardTitle: tempQuestion,
        answer: tempAnswer
    };

    const url = editBool ? `/updateFlashcard/${editingFlashcardId}` : '/addFlashcard';
    const method = editBool ? 'PUT' : 'POST';
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcardData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (editBool) {
                    updateFlashcardUI(editingFlashcardId, tempQuestion, tempAnswer);
                } else {
                    addFlashcardToUI(data.flashcard);
                }
                resetEditState();
                refreshFlashcards();
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

// Helper function to update a flashcard in the UI
function updateFlashcardUI(id, flashcardTitle, answer) {
    let flashcardDiv = document.querySelector(`div[data-id="${id}"]`);
    if (flashcardDiv) {
        flashcardDiv.querySelector(".question-div").textContent = flashcardTitle;
        flashcardDiv.querySelector(".answer-div").textContent = answer;
    }
    refreshFlashcards();
}

// Clear error message when the user starts typing in the question or answer fields
flashcardTitle.addEventListener('input', () => {
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

    const questionText = flashcard.flashcardTitle;
    const answerText = flashcard.answer;

    div.dataset.id = flashcard.flashcardID;

    div.innerHTML = `
        <div class="question-div">${questionText}</div>
        <p class="answer-div hide">${answerText}</p>
        <a href="#" class="show-hide-btn">Show answer / Hide answer</a>
        <br>
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


function editFlashcard(flashcardDiv) {
    const questionText = flashcardDiv.querySelector(".question-div").textContent;
    const answerText = flashcardDiv.querySelector(".answer-div").textContent;
    editingFlashcardId = flashcardDiv.dataset.id;

    flashcardTitle.value = questionText;
    answer.value = answerText;
    editBool = true; // Set edit mode to true
    addQuestionCard.classList.remove("hide");
    container.classList.add("hide");
    cardButton.textContent = 'Update Flashcard';

    submitEdit = function () {
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

    span.onclick = function () {
        modal.style.display = "none";
    }

    cancelDelete.onclick = function () {
        modal.style.display = "none";
    }

    confirmDelete.onclick = function () {
        fetch(`/deleteFlashcard/${flashcardId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector(`div[data-id="${flashcardId}"]`).remove();
                    localStorage.setItem('updateCounts', 'true');
                    modal.style.display = "none";
                    refreshFlashcards();
                } else {
                    console.error('Error deleting flashcard:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    window.onclick = function (event) {
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


// Call fetchAndDisplayFlashcards when the page loads
document.addEventListener('DOMContentLoaded', refreshFlashcards);

document.getElementById('delete-all-flashcards').addEventListener('click', () => {
    const deleteAllModal = document.getElementById("deleteAllModal");
    const confirmDeleteAll = document.getElementById("confirmDeleteAll");
    const cancelDeleteAll = document.getElementById("cancelDeleteAll");
    const spanDeleteAllClose = document.querySelector(".delete-all-close");

    deleteAllModal.style.display = "block";

    spanDeleteAllClose.onclick = function () {
        deleteAllModal.style.display = "none";
    }

    cancelDeleteAll.onclick = function () {
        deleteAllModal.style.display = "none";
    }

    confirmDeleteAll.onclick = function () {
        fetch(`/deleteAllFlashcardsInCategory?category=${encodeURIComponent(currentCategory)}`, {method: 'DELETE'})
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

    window.onclick = function (event) {
        if (event.target === deleteAllModal) {
            deleteAllModal.style.display = "none";
        }
    }
});
