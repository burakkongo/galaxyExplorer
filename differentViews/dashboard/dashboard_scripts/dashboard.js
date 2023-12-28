

function navigateTo(subject) {

    // Basispfad zu den Flashcard-Views
    const baseFlashcardsViewPath = '../flashcardsViews/';

    // Name der HTML-Seite, die die Flashcards für das gewählte Fach enthält
    let subjectPage = '';

    switch (subject) {
        case 'biology':
            subjectPage = 'biology.html';
            break;
        case 'chemistry':
            subjectPage = 'chemistry.html';
            break;
        case 'geography':
            subjectPage = 'geography.html';
            break;
        case 'history':
            subjectPage = 'history.html';
            break;
        case 'mathematics':
            subjectPage = 'mathematics.html';
            break;
        case 'programming':
            subjectPage = 'programming.html';
            break;
        case 'map':
            window.location.href = '../adventureMap/adventure_map.html';
            return;
        default:
            console.error('Subject not found');
            return;
    }

    // Ändert die aktuelle URL zur Ziel-URL, was die Navigation zur neuen Seite auslöst
    window.location.href = baseFlashcardsViewPath + subjectPage;
}
