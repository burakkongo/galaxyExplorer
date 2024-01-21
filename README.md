# GalaxyExplorer

Welcome to Galaxy Explorer! This interactive web-based learning platform is brought to you by the students of FH Campus Wien. Our mission is to transform traditional learning by integrating the fun of gaming with the power of knowledge acquisition. Galaxy Explorer is designed to be an engaging and intuitive environment for self-directed learning, ideal for children and anyone eager to learn.

### Getting Started
Before launching the project, you need to create a .env file in the root directory. This file is essential for the database connection as it stores the variables for database access. We will provide you the credentials per mail.


With the .env file set up and the database ready, import all the necessary modules by running npm install in the terminal.

To start the project, run the app.js file. Since the server starts on port 3000, navigate to http://localhost:3000 in your browser to access the web app.

### Quick User Quide
#### Register and Login
Upon visiting the website, you'll land on the landing page. Click "Get Started" to proceed to registration. Here you can create a user account. If you already have an account, simply log in with your credentials.

#### Dashboard
After logging in, you'll be directed to the dashboard. This is the central hub where you can access different flashcard categories to create, edit, or delete flashcards.

On the dashboard, you'll also find buttons for importing flashcards from CSV files, deleting all flashcards, and navigating to the Quiz View and the Map.

#### Quiz View
In the Quiz View, you can create or delete quizzes. All created quizzes are listed here, and you can start a quiz by clicking "Load Quiz". Once you've answered the questions and submitted the quiz, you'll get instant feedback on your answers. If all questions are answered correctly, you earn 1 XP point (1 liter of Rocket Fuel).

#### Map
The Map displays the different planets (levels). For every 10 liters of Rocket Fuel (XP points), a new planet is unlocked. The ultimate goal is to reach Earth. Each new Level unlocks a new skin and provides background information about the unlocked planet. Click on the unlocked planet to view it.
