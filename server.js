const { app, BrowserWindow } = require('electron');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors module
require('dotenv').config();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadURL('http://localhost:3000');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

// Express server setup
const serverApp = express();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((error) => {
    if (error) {
        console.error("Error connecting to MySQL:", error);
        return;
    }
    console.log("Connected to MySQL database successfully");
});

serverApp.use(cors()); // Enable CORS for all routes
serverApp.use(express.urlencoded({ extended: true }));
serverApp.use(bodyParser.json());

// Serve static files from the root directory (my-typing-tutor)
serverApp.use(express.static(path.join(__dirname, 'TypingTest')));
serverApp.use(express.static(__dirname)); // Serve static files from the root directory

serverApp.use('/paragraphs', express.static(path.join(__dirname, 'paragraphs')));

// Route to serve index.html initially
serverApp.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

serverApp.post('/saveResults', (req, res) => {
    const { name, time, testType, elapsedTime, typedWords, correctWords, incorrectWords, backspaceCount, accuracy, keystrokes } = req.body;
    
    // Validate and sanitize inputs as necessary
    if (!name || !testType) {
        return res.status(400).send('Name and test type are required.');
    }

    const query = `INSERT INTO results (name, time_in_minutes, test_type, elapsed_time, typed_words, correct_words, incorrect_words, backspace_count, accuracy, keystrokes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, time, testType, elapsedTime, typedWords, correctWords, incorrectWords, backspaceCount, accuracy, keystrokes];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error("Error saving results:", error);
            return res.status(500).send('Error saving results.');
        }
        console.log("Results saved successfully");
        res.status(200).send('Results saved successfully.');
    });
});

const port = 3000;
serverApp.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
