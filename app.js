const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000; // or use a different port

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Use middleware to serve static files and parse request bodies
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Registration static route with routes to scripts and styles
app.use('/registration', express.static(path.join(__dirname, 'registration')));
app.use('/registration_scripts', express.static(path.join(__dirname, 'registration', 'registration_scripts')));
app.use('/registration_styling', express.static(path.join(__dirname, 'registration', 'registration_styling')));

// Login static route with routes to scripts and styles
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/login_scripts', express.static(path.join(__dirname, 'login', 'login_scripts')));
app.use('/login_styling', express.static(path.join(__dirname, 'login', 'login_styling')));

// Landing page static route with routes to scripts and styles
app.use('/landingPage', express.static(path.join(__dirname, 'landingPage')));
app.use('/landingPage_scripts', express.static(path.join(__dirname, 'landingPage', 'landingPage_scripts')));
app.use('/landingPage_styling', express.static(path.join(__dirname, 'landingPage', 'landingPage_styling')));

// Adventure Map static route with routes to scripts and styles
app.use('/adventureMap', express.static(path.join(__dirname, 'differentViews', 'adventureMap')));
app.use('/adventureMap_scripts', express.static(path.join(__dirname, 'differentViews', 'adventureMap', 'adventureMap_scripts')));
app.use('/adventureMap_styling', express.static(path.join(__dirname, 'differentViews', 'adventureMap', 'adventureMap_styling')));

// Dashboard static route with routes to scripts and styles
app.use('/dashboard', express.static(path.join(__dirname, 'differentViews', 'dashboard')));
app.use('/dashboard_scripts', express.static(path.join(__dirname, 'differentViews', 'dashboard', 'dashboard_scripts')));
app.use('/dashboard_styling', express.static(path.join(__dirname, 'differentViews', 'dashboard', 'dashboard_styling')));

// Flashcards view static route with routes to scripts and styles
app.use('/flashcardsViews', express.static(path.join(__dirname, 'differentViews', 'flashcardsViews')));
app.use('/flashcardsViews_scripts', express.static(path.join(__dirname, 'differentViews', 'flashcardsViews', 'flashcardsViews_scripts')));
app.use('/flashcardsViews_styling', express.static(path.join(__dirname, 'differentViews', 'flashcardsViews', 'flashcardsViews_styling')));

// Quiz view static route with routes to scripts and styles
app.use('/quizView', express.static(path.join(__dirname, 'differentViews', 'quizview')));
app.use('/quizview_scripts', express.static(path.join(__dirname, 'differentViews', 'quizview', 'quizview_scripts')));
app.use('/quizview_styling', express.static(path.join(__dirname, 'differentViews', 'quizview', 'quizview_styling')));

// Database connection configuration 02.01.2024
const db = mysql.createConnection({
    host: 'sql8.freesqldatabase.com',
    user: 'sql8674277',
    database: 'sql8674277',
    password: '8WvdRrPxqF',
    port: 3306
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database', err);
        return;
    }
    console.log('Connected to the database');
});

// Serve the index page from the landingPage directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landingPage', 'index.html'));
});

// Serve the registration page
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration', 'registration.html'));
});

// Handle registration POST request
app.post('/registration', (req, res) => {
    const {username, password} = req.body;
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error checking user');
            return;
        }
        if (results.length > 0) {
            res.send('User already registered');
        } else {
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(query, [username, password], (err, result) => {
                if (err) {
                    res.status(500).send('Error registering user');
                    return;
                }
                res.redirect('/login');
            });
        }
    });
});

// Serve the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Handle login POST request
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const query = 'SELECT userID FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            res.status(500).send('Error logging in');
            return;
        }
        if (results.length > 0) {
            const userID = results[0].userID;
            res.redirect('/dashboard');
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'differentViews', 'dashboard', 'dashboard.html'));
});

// Add flashcard route
app.post('/addFlashcard', (req, res) => {
    const {category, flashcardTitle, answer, userID} = req.body;
    const checkQuery = 'SELECT * FROM flashcards WHERE category = ? AND flashcardTitle = ?';
    db.query(checkQuery, [category, flashcardTitle], (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error checking for flashcard'});
            return;
        }
        if (results.length > 0) {
            res.status(409).json({success: false, error: 'Flashcard already exists'});
            return;
        }
        const insertQuery = 'INSERT INTO flashcards (category, flashcardTitle, answer, userID) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [category, flashcardTitle, answer, userID], (insertErr, insertResults) => {
            if (insertErr) {
                res.status(500).json({success: false, error: 'Error saving flashcard'});
                return;
            }
            res.json({success: true, flashcard: {category, flashcardTitle, answer, userID}});
        });
    });
});

// Get flashcards route
app.get('/getFlashcards', (req, res) => {
    const {category} = req.query;
    const query = 'SELECT * FROM flashcards WHERE category = ?';
    db.query(query, [category], (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error fetching flashcards'});
            return;
        }
        res.json(results);
    });
});

// Get flashcards by category route
app.get('/getFlashcards/:category', (req, res) => {
    const category = req.params.category;
    const query = 'SELECT * FROM flashcards WHERE category = ?';
    db.query(query, [category], (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error fetching flashcards'});
            return;
        }
        res.json(results);
    });
});

// Get flashcard counts per category route
app.get('/getFlashcardCounts', (req, res) => {
    const query = 'SELECT category, COUNT(*) as Count FROM flashcards GROUP BY category';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error fetching flashcard counts'});
            return;
        }
        res.json(results);
    });
});

// Update flashcard route
app.put('/updateFlashcard/:id', (req, res) => {
    const {id} = req.params;
    const {category, flashcardTitle, answer} = req.body;
    const updateQuery = 'UPDATE flashcards SET category = ?, flashcardTitle = ?, answer = ? WHERE flashcardID = ?';
    db.query(updateQuery, [category, flashcardTitle, answer, id], (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error updating flashcard'});
            return;
        }
        res.json({success: true});
    });
});

// Delete flashcard route
app.delete('/deleteFlashcard/:id', (req, res) => {
    const {id} = req.params;
    const deleteQuery = 'DELETE FROM flashcards WHERE flashcardID = ?';
    db.query(deleteQuery, [id], (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error deleting flashcard'});
            return;
        }
        res.json({success: true});
    });
});

// Delete all flashcards in a category route
app.delete('/deleteAllFlashcards', (req, res) => {
    const {category} = req.query;
    const deleteQuery = 'DELETE FROM flashcards WHERE category = ?';
    db.query(deleteQuery, [category], (err, results) => {
        if (err) {
            res.status(500).json({success: false, error: 'Error deleting flashcards'});
            return;
        }
        res.json({success: true, message: 'All flashcards deleted successfully.'});
    });
});