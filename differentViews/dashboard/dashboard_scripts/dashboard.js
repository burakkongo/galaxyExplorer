document.addEventListener('visibilitychange', function () {
    // Check if the updateCounts flag is set in local storage
    if (localStorage.getItem('updateCounts') === 'true') {
        // If so, call the updateFlashcardCounts function
        updateFlashcardCounts();
        // Then clear the flag
        localStorage.removeItem('updateCounts');
    }
});

function navigateTo(category) {
    if (category === 'map') {
        // Navigate to the map page if 'map' is the category
        window.location.href = '../adventureMap/adventure_map.html';
    } else {
        // Otherwise, navigate to the flashcards page with the correct category
        // The relative path goes up one directory from 'dashboard_scripts' and then into 'flashcardsViews'
        window.location.href = `../flashcardsViews/flashcards.html?category=${encodeURIComponent(category)}`;
    }
}

function updateFlashcardCounts() {
    // Fetch flashcard counts from the server
    fetch('/getFlashcardCounts')
        .then(response => response.json())
        .then(data => {
            // The data is expected to be an array of objects with 'Category' and 'Count' properties
            data.forEach(item => {
                const countElement = document.getElementById(`${item.Category.toLowerCase()}-count`);
                if (countElement) {
                    countElement.textContent = item.Count > 0 ? `${item.Count} Flashcards` : 'No flashcards';
                }
            });

            // Update categories with no flashcards after all counts are loaded
            const categories = ['biology', 'chemistry', 'geography', 'history', 'mathematics', 'programming'];
            categories.forEach(category => {
                const countElement = document.getElementById(`${category}-count`);
                if (countElement && countElement.textContent === 'Loading...') {
                    countElement.textContent = 'No Flashcards';
                }
            });
        })
        .catch(error => {
            console.error('Error fetching flashcard counts:', error);
            // If there's an error, you may want to set all to 'No flashcards' or handle it as appropriate
        });
}

updateFlashcardCounts();

document.getElementById('import-flashcards-btn').addEventListener('click', function () {
    document.getElementById('flashcards-file-input').click();
});

document.getElementById('flashcards-file-input').addEventListener('change', function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        var text = e.target.result;
        var lines = text.split('\n');
        // Parse CSV lines into objects
        var flashcards = lines.slice(1).map(line => {
            var [category, title, answer] = line.split(',');
            return {category, title, answer};
        });
        sendFlashcardsToServer(flashcards);
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
        body: JSON.stringify({flashcards: flashcards}),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Flashcards imported successfully!');
                updateFlashcardCounts()
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

var confirmDeleteModal = document.getElementById('confirmDeleteModal');
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