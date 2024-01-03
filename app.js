const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000; // or use a different port

const bcrypt = require('bcrypt');
const saltRounds = 10; // for bcrypt

// Configuring session management middleware
app.use(session({
    secret: 'galaxyExplorer24',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Disabled caching to instantly see changes in the flashcards count
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
});

// Starting the node server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Using middleware to serve static files and parse request bodies
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

// Building the connection to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database', err);
        return;
    }
    console.log('Connected to the database');
});

// Serving the index page from the landingPage directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landingPage', 'index.html'));
});

// Serving the registration page
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration', 'registration.html'));
});

// Handling registration POST request
app.post('/registration', (req, res) => {
    const { username, password } = req.body;
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error checking user');
            return;
        }
        if (results.length > 0) {
            res.send('User already registered');
        } else {
            // Hash the password
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    res.status(500).send('Error hashing password');
                    return;
                }
                const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
                db.query(query, [username, hash], (err) => {
                    if (err) {
                        res.status(500).send('Error registering user');
                        return;
                    }
                    res.redirect('/login');
                });
            });
        }
    });
});

// Serving the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Handling login POST requests
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT userID, password FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error logging in');
            return;
        }
        if (results.length > 0) {
            // Compare hashed password
            bcrypt.compare(password, results[0].password, (err, result) => {
                if (result) {
                    // Saving userID in session
                    req.session.userID = results[0].userID;
                    res.redirect('/dashboard');
                } else {
                    res.send('Invalid username or password');
                }
            });
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Endpoint to get the username
app.get('/getUsername', (req, res) => {
    if (req.session.userID) {
        const query = 'SELECT username FROM users WHERE userID = ?';
        db.query(query, [req.session.userID], (err, results) => {
            if (err) {
                res.status(500).send('Error fetching username');
                return;
            }
            if (results.length > 0) {
                res.json({ username: results[0].username });
            } else {
                res.status(404).send('User not found');
            }
        });
    } else {
        res.status(401).send('Not logged in');
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'differentViews', 'dashboard', 'dashboard.html'));
});

// Adding flashcards
app.post('/addFlashcard', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }
    const { category, flashcardTitle, answer } = req.body;
    const userID = req.session.userID; // Get userID from session
    const insertQuery = 'INSERT INTO flashcards (category, flashcardTitle, answer, userID) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [category, flashcardTitle, answer, userID], (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error saving flashcard' });
        }
        res.json({ success: true, flashcard: { category, flashcardTitle, answer, userID } });
    });
});

// Getting flashcards
app.get('/getFlashcards', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }
    const { category } = req.query;
    const userID = req.session.userID; // Get userID from session
    const query = 'SELECT flashcardID, category, flashcardTitle, answer FROM flashcards WHERE category = ? AND userID = ?';
    db.query(query, [category, userID], (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching flashcards');
        } else {
            res.json(results);
        }
    });
});

// Getting flashcard counts
app.get('/getFlashcardCounts', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }
    const userID = req.session.userID; // Get userID from session
    const query = 'SELECT category, COUNT(*) as Count FROM flashcards WHERE userID = ? GROUP BY category';
    db.query(query, [userID], (err, results) => {
        if (err) {
            return res.status(500).json({success: false, error: 'Error fetching flashcard counts'});
        }
        res.json(results);
    });
});

// Updating flashcard
app.put('/updateFlashcard/:id', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }
    const { category, flashcardTitle, answer } = req.body;
    const userID = req.session.userID; // Get userID from session
    const { id } = req.params;
    const updateQuery = 'UPDATE flashcards SET category = ?, flashcardTitle = ?, answer = ? WHERE flashcardID = ? AND userID = ?';
    db.query(updateQuery, [category, flashcardTitle, answer, id, userID], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error updating flashcard' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Flashcard not found or user mismatch' });
        }
        res.json({ success: true });
    });
});

// Deleting single flashcard
app.delete('/deleteFlashcard/:id', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }
    const userID = req.session.userID; // Get userID from session
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM flashcards WHERE flashcardID = ? AND userID = ?';
    db.query(deleteQuery, [id, userID], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error deleting flashcard' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Flashcard not found or user mismatch' });
        }
        res.json({ success: true });
    });
});

// Deleting all flashcards in a category route linked to userID
app.delete('/deleteAllFlashcards', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }
    const { category } = req.query;
    const userID = req.session.userID; // Get userID from session
    const deleteQuery = 'DELETE FROM flashcards WHERE category = ? AND userID = ?';
    db.query(deleteQuery, [category, userID], (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error deleting flashcards' });
        }
        res.json({ success: true, message: 'All flashcards deleted successfully.' });
    });
});

app.post('/importFlashcards', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).send('User not authenticated');
    }

    const flashcards = req.body.flashcards;
    const userID = req.session.userID;

    const insertQuery = 'INSERT INTO flashcards (category, flashcardTitle, answer, userID) VALUES ?';

    const values = flashcards.map(f => [f.category, f.flashcardTitle, f.answer, userID]);

    db.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error('Error importing flashcards:', err);
            return res.status(500).json({ success: false, error: 'Error importing flashcards' });
        }
        res.json({ success: true, message: 'Flashcards imported successfully', importedCount: result.affectedRows });
    });
});
