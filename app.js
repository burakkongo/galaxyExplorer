const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path')
const port = 3000;

app.use(express.static('differentViews'));

// Use express.json() to parse JSON-encoded bodies
app.use(express.json());

// Set up your database connection
const db = mysql.createConnection({
    host: 'sql11.freesqldatabase.com',
    user: 'sql11672895',
    password: 'BZDVYvzD6x',
    database: 'sql11672895',
    port: 3306
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database', err);
        throw err;
    }
    console.log('Connected to database');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'differentViews','dashboard', 'dashboard.html'));
});

// Endpoint to add a flashcard
app.post('/addFlashcard', (req, res) => {
    const { category, title, answer, userID } = req.body;

    // First, check if a flashcard with the same title and category already exists
    const checkQuery = 'SELECT * FROM flashcards WHERE Category = ? AND Title = ?';

    db.query(checkQuery, [category, title], (err, results) => {
        if (err) {
            console.error('Error checking for existing flashcard', err);
            res.status(500).json({ success: false, error: 'Error checking for flashcard' });
            return;
        }
        if (results.length > 0) {
            // If a flashcard with the same title and category exists, don't insert a new one
            res.status(409).json({ success: false, error: 'Flashcard already exists' });
            return;
        }

        // If no existing flashcard is found, proceed to insert the new one
        const insertQuery = `INSERT INTO flashcards (Category, Title, Answer, UserID) VALUES (?, ?, ?, ?)`;
        db.query(insertQuery, [category, title, answer, userID], (insertErr, insertResults) => {
            if (insertErr) {
                console.error('Error inserting flashcard', insertErr);
                res.status(500).json({ success: false, error: 'Error saving flashcard' });
                return;
            }
            res.json({ success: true, flashcard: { Category: category, Title: title, Answer: answer, UserID: userID } });
        });
    });
});

// Endpoint to get flashcards by category using query parameter
app.get('/getFlashcards', (req, res) => {
    const { category } = req.query;
    const query = 'SELECT * FROM flashcards WHERE Category = ?';

    db.query(query, [category], (err, results) => {
        if (err) {
            console.error('Error fetching flashcards', err);
            res.status(500).json({ success: false, error: 'Error fetching flashcards' });
            return;
        }
        res.json(results);
    });
});
// Endpoint to get flashcards by category using path parameter
app.get('/getFlashcards/:category', (req, res) => {
    const category = req.params.category;
    const query = 'SELECT * FROM flashcards WHERE Category = ?';

    db.query(query, [category], (err, results) => {
        if (err) {
            console.error('Error fetching flashcards', err);
            res.status(500).json({ success: false, error: 'Error fetching flashcards' });
            return;
        }
        res.json(results);
    });
});


// Endpoint to get flashcard counts per category
app.get('/getFlashcardCounts', (req, res) => {
    const query = 'SELECT Category, COUNT(*) as Count FROM flashcards GROUP BY Category';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching flashcard counts', err);
            res.status(500).json({ success: false, error: 'Error fetching flashcard counts' });
        } else {
            res.json(results);
        }
    });
});


// Endpoint to update a flashcard
app.put('/updateFlashcard/:id', (req, res) => {
    const { id } = req.params;
    const { category, title, answer } = req.body;
    const updateQuery = 'UPDATE flashcards SET Category = ?, Title = ?, Answer = ? WHERE FlashcardID = ?';

    db.query(updateQuery, [category, title, answer, id], (err, results) => {
        if (err) {
            console.error('Error updating flashcard', err);
            res.status(500).json({ success: false, error: 'Error updating flashcard' });
        } else {
            res.json({ success: true });
        }
    });
});

// Endpoint to delete a flashcard
app.delete('/deleteFlashcard/:id', (req, res) => {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM flashcards WHERE FlashcardID = ?';

    db.query(deleteQuery, [id], (err, results) => {
        if (err) {
            console.error('Error deleting flashcard', err);
            res.status(500).json({ success: false, error: 'Error deleting flashcard' });
        } else {
            res.json({ success: true });
        }
    });
});

// Endpoint to delete all flashcards in a category
app.delete('/deleteAllFlashcards', (req, res) => {
    const { category } = req.query;
    const deleteQuery = 'DELETE FROM flashcards WHERE Category = ?';

    db.query(deleteQuery, [category], (err, results) => {
        if (err) {
            console.error('Error deleting flashcards', err);
            res.status(500).json({ success: false, error: 'Error deleting flashcards' });
        } else {
            res.json({ success: true, message: 'All flashcards deleted successfully.' });
        }
    });
});

// In your app.js
app.post('/importFlashcards', (req, res) => {
    const flashcards = req.body.flashcards;
    // Start a transaction
    db.beginTransaction(err => {
        if (err) { throw err; }
        // Use a loop or a bulk insert query to add flashcards
        flashcards.forEach(flashcard => {
            const { category, title, answer } = flashcard;
            const insertQuery = `INSERT INTO flashcards (Category, Title, Answer) VALUES (?, ?, ?)`;
            db.query(insertQuery, [category, title, answer], (insertErr, insertResults) => {
                if (insertErr) {
                    // If an error occurs, we will roll back the transaction
                    return db.rollback(() => {
                        throw insertErr;
                    });
                }
            });
        });
        // If we reach this point without errors, commit the transaction
        db.commit(commitErr => {
            if (commitErr) {
                return db.rollback(() => {
                    throw commitErr;
                });
            }
            res.json({ success: true });
        });
    });
});

// Endpoint to delete all flashcards
app.delete('/deleteAllFlashcardsAllCategories', (req, res) => {
    const deleteQuery = 'DELETE FROM flashcards';

    db.query(deleteQuery, (err, results) => {
        if (err) {
            console.error('Error deleting all flashcards', err);
            res.status(500).json({ success: false, error: 'Error deleting all flashcards' });
        } else {
            res.json({ success: true, message: 'All flashcards deleted successfully.' });
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});