let timer;
let elapsedSeconds = 0;
let keystrokes = 0;

function startTest() {
    const selectedTime = localStorage.getItem('selectedTime');
    if (selectedTime) {
        const totalTime = parseInt(selectedTime) * 60; // convert minutes to seconds

        // Clear any existing timer
        if (timer) {
            clearInterval(timer);
        }
        elapsedSeconds = 0;
        keystrokes = 0;
        document.getElementById('keystrokes').textContent = keystrokes;
        document.getElementById('typed-text-areas').removeAttribute('readonly');
        timer = setInterval(() => {
            elapsedSeconds++;
            const remainingTime = totalTime - elapsedSeconds;

            if (remainingTime <= 0) {
                clearInterval(timer);
                alert('Time is up!');
                // Optionally, you can call submitResults here if you want to automatically submit results when the time is up
                // submitResults();
            }

            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;

            document.getElementById('elapsed-time').textContent =
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            updateWPM();
            updateAccuracy();
       
        }, 1000);
    } else {
        alert('No time selected');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const selectedParagraph = localStorage.getItem('selectedParagraph');
    if (selectedParagraph) {
        document.querySelector('.text-test').textContent = selectedParagraph;
    }
});

// Function to extract URL parameter by name
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Get the name and test parameters from URL
var userName = getUrlParameter('name');
var userTime = getUrlParameter('time');
var testType = getUrlParameter('test');

// Set the user's name and test type in the welcome message
document.getElementById('userName').textContent = userName;
document.getElementById('userTime').textContent = userTime + " minute(s)";
document.getElementById('testType').textContent = testType;

const typedTextArea = document.getElementById('typed-text-areas');
let correctWords = 0;
let incorrectWords = 0;
let backspaceCount = 0;

typedTextArea.addEventListener('input', () => {
    keystrokes++;
    document.getElementById('keystrokes').textContent = keystrokes;

    const typedText = typedTextArea.value;
    const targetText = document.querySelector('.text-test').textContent;

    // Calculate typed words
    const typedWords = typedText.trim().split(/\s+/).length;
    document.getElementById('typed-words').textContent = typedWords;

    // Calculate correct and incorrect words
    const targetWords = targetText.trim().split(/\s+/);
    correctWords = 0;
    incorrectWords = 0;

    typedText.trim().split(/\s+/).forEach((word, index) => {
        if (word === targetWords[index]) {
            correctWords++;
        } else {
            incorrectWords++;
        }
    });

    document.getElementById('correct-words').textContent = correctWords;
    document.getElementById('incorrect-words').textContent = incorrectWords;
    updateWPM();
    updateAccuracy();
});

typedTextArea.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace') {
        backspaceCount++;
        document.getElementById('backspace-count').textContent = backspaceCount;
    }
});

function updateWPM() {
    const minutesElapsed = elapsedSeconds / 60;
    const correctWords = parseInt(document.getElementById('correct-words').textContent);
    const wpm = minutesElapsed > 0 ? (correctWords / minutesElapsed) : 0;
    document.getElementById('wpm').textContent = Math.round(wpm);
}

function updateAccuracy() {
    const correctWords = parseInt(document.getElementById('correct-words').textContent);
    const typedWords = parseInt(document.getElementById('typed-words').textContent);
    const accuracy = typedWords > 0 ? (correctWords / typedWords) * 100 : 0;
    document.getElementById('accuracy').textContent = `${accuracy.toFixed(2)}%`;
}

// Function to submit the results
async function submitResults() {
    // Collect results from the page
    const elapsedTime = document.getElementById('elapsed-time').textContent;
    const typedWords = document.getElementById('typed-words').textContent;
    const correctWords = document.getElementById('correct-words').textContent;
    const incorrectWords = document.getElementById('incorrect-words').textContent;
    const backspaceCount = document.getElementById('backspace-count').textContent;
    const accuracy = document.getElementById('accuracy').textContent;
    const keystrokes = document.getElementById('keystrokes').textContent;
    
    // Collect user information if needed
    const name = getUrlParameter('name');
    const time = getUrlParameter('time');
    const testType = getUrlParameter('test');
    
    // Data to be sent to the server
    const results = {
        name,
        time,
        testType,
        elapsedTime,
        typedWords,
        correctWords,
        incorrectWords,
        backspaceCount,
        accuracy,
        keystrokes
    };

    try {
        const response = await fetch('/saveResults', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(results)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        alert('Results submitted successfully!');
        window.location.href = '../index.html'; // Redirect after submission
    } catch (error) {
        console.error('Failed to submit results:', error);
        alert('Failed to submit results.');
    }
}

// Attach submitResults to the Submit button
document.querySelector('.Submit').addEventListener('click', submitResults);
