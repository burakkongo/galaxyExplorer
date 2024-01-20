document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.querySelector('button');
    resetButton.addEventListener('click', resetUserXP);
});

function resetUserXP() {
    fetch('/resetUserXP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // Needed to include the session cookie
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Experience points have been reset. Ready for another adventure!');
            } else {
                alert('Note: Your experience points may not have been reset.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was an error processing your request.');
        })
        .finally(() => {
            // Redirect to the dashboard regardless of the result
            window.location.href = '/dashboard';
        });
}

