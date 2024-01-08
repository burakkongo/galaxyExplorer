window.addEventListener('pageshow', (event) => {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        // Page is loaded from cache, update the flashcard counts
        updateFlashcardCounts();
    }
});

function fetchAndDisplayUsername() {
    fetch('/getUsername')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.username) {
                document.getElementById('header').querySelector('h1').textContent = `Hello, ${data.username}!`;
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Call the function on page load to show the user greeting
fetchAndDisplayUsername();

document.addEventListener('visibilitychange', function () {
    // Check if the updateCounts flag is set in local storage
    if (localStorage.getItem('updateCounts') === 'true') {
        // If so, call the updateFlashcardCounts function
        updateFlashcardCounts();
        // Then clear the flag
        localStorage.removeItem('updateCounts');
    }
});

const navigateTo = (category) => {
    if (category === 'map') {
        // Navigate to the map page
        window.location.href = '../adventureMap/adventure_map.html';
    } else {
        // Otherwise, navigate to the flashcards page with the correct category
        // The relative path goes up one directory from 'dashboard_scripts' and then into 'flashcardsViews'
        window.location.href = `../flashcardsViews/flashcards.html?category=${encodeURIComponent(category)}`;
    }
};

const updateFlashcardCounts = () => {
    // Fetch flashcard counts from the server
    fetch('/getFlashcardCounts')
        .then(response => response.json())
        .then(data => {
            const categories = ['biology', 'chemistry', 'geography', 'history', 'mathematics', 'programming'];

            // Reset all counts to 'No flashcards'
            categories.forEach(category => {
                const countElement = document.getElementById(`${category}-count`);
                if (countElement) {
                    countElement.textContent = 'No flashcards';
                }
            });

            // Update counts with data from the server
            data.forEach(item => {
                const countElement = document.getElementById(`${item.category.toLowerCase()}-count`);
                if (countElement) {
                    countElement.textContent = item.Count > 0 ? `${item.Count} Flashcards` : 'No flashcards';
                }
            });
        })
        .catch(error => {
            console.error('Error fetching flashcard counts:', error);
            // If there's an error, update UI accordingly
            const categories = ['biology', 'chemistry', 'geography', 'history', 'mathematics', 'programming'];
            categories.forEach(category => {
                const countElement = document.getElementById(`${category}-count`);
                if (countElement) {
                    countElement.textContent = 'Error fetching counts';
                }
            });
        });
};

// Call updateFlashcardCounts on page load and when visibility changes
document.addEventListener('DOMContentLoaded', updateFlashcardCounts);
document.addEventListener('visibilitychange', function () {
    if (localStorage.getItem('updateCounts') === 'true') {
        updateFlashcardCounts();
        localStorage.removeItem('updateCounts');
    }
});

document.getElementById('import-flashcards-btn').addEventListener('click', function () {
    document.getElementById('flashcards-file-input').click();
});

document.getElementById('flashcards-file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());

        if (headers.length !== 3 || headers[0] !== 'category' || headers[1] !== 'question' || headers[2] !== 'answer') {
            alert('CSV format is incorrect. Please ensure the first line has headers "Category,Question,Answer".');
            return;
        }

        const flashcards = lines.slice(1).map(line => {
            const [category, flashcardTitle, answer] = line.split(',').map(item => item.trim());
            if (!category || !flashcardTitle || !answer) {
                throw new Error('Each row must include a category, question, and answer.');
            }
            return {category, flashcardTitle, answer};
        });

        sendFlashcardsToServer(flashcards);
    };

    reader.onerror = () => {
        alert('Failed to read the file.');
    };

    reader.readAsText(file);
});

function sendFlashcardsToServer(flashcards) {
    // Send the flashcards to the backend
    fetch('/importFlashcards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({flashcards}),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Flashcards imported successfully!');
                // Maybe call a function to update the UI here
            } else {
                alert('Failed to import flashcards: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while importing flashcards.');
        });
}


document.getElementById('delete-all-flashcards-btn').addEventListener('click', function () {
    document.getElementById('confirmDeleteModal').style.display = 'block';
});

const confirmDeleteModal = document.getElementById('confirmDeleteModal');
document.getElementById('confirmDeleteModalClose').onclick = function () {
    confirmDeleteModal.style.display = "none";
};

document.getElementById('cancelDelete').addEventListener('click', function () {
    confirmDeleteModal.style.display = 'none';
});

document.getElementById('confirmDelete').addEventListener('click', function () {
    // Logic to delete all flashcards
    fetch('/deleteAllFlashcardsAllCategories', {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('All flashcards deleted successfully!');
                setTimeout(updateFlashcardCounts, 1000);
            } else {
                alert('Failed to delete flashcards.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting flashcards.');
        });
    confirmDeleteModal.style.display = 'none';
});

// Close the modal if clicked outside of it
window.onclick = function (event) {
    if (event.target === confirmDeleteModal) {
        confirmDeleteModal.style.display = "none";
    }
};

//Redirect to quizView on button click
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('generate-quiz-button').addEventListener('click', function () {
        // Navigate to the registration.html page
        window.location.href = '/quizView';
    });
});
