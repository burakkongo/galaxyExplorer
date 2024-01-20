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
                // Redirect or update the UI as needed
            } else {
                alert('There was a problem resetting your experience points.');
            }
            window.location.href = '/dashboard';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was a problem resetting your experience points.');
        });
}
