async function fetchParagraphs(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text.split('\n').filter(paragraph => paragraph.trim() !== '');
    } catch (error) {
        console.error('Failed to fetch paragraphs:', error);
        return [];
    }
}

async function populateParagraphs() {
    const testType = document.getElementById('test').value;
    const paragraphSelect = document.getElementById('paragraph');
    paragraphSelect.innerHTML = '<option value="" disabled selected>Select a paragraph</option>';

    let paragraphs = [];
    if (testType === 'English') {
        paragraphs = await fetchParagraphs('../paragraphs/EngPara.txt');
    } else if (testType === 'Hindi') {
        paragraphs = await fetchParagraphs('../paragraphs/HindiPara.txt');
    } else if (testType === 'Remington Gail') {
        paragraphs = await fetchParagraphs('../paragraphs/Reemintangill.txt');
    }

    paragraphs.forEach((paragraph, index) => {
        const option = document.createElement('option');
        option.value = paragraph;
        option.textContent = `Test-${index + 1}`;
        paragraphSelect.appendChild(option);
    });
}

function redirectToTest(event) {
    event.preventDefault();

    const testType = document.getElementById('test').value;
    const selectedParagraph = document.getElementById('paragraph').value;

    if (!testType || !selectedParagraph) {
        alert("Please select both test type and paragraph to start.");
        return false;
    }

    localStorage.setItem('selectedParagraph', selectedParagraph);

    if (testType === 'Hindi') {
        window.location.href = 'HindiTest.html';
    } else if (testType === 'English') {
        window.location.href = 'EnglishTest.html';
    } else if (testType === 'Remington Gail') {
        window.location.href = 'ReemintangillTest.html';
    }

    return false; // Prevent form submission
}

document.getElementById('test').addEventListener('change', populateParagraphs);
document.getElementById('typingForm').addEventListener('submit', redirectToTest);

document.addEventListener('DOMContentLoaded', () => {
    // Ensure paragraphs are loaded if test type is already selected on page load
    populateTimeOptions();// Populate time options on page load
    if (document.getElementById('test').value) {
        populateParagraphs();
    }
});
function redirectToTest(event) {
    event.preventDefault();
    const testType = document.getElementById('test').value;
    const selectedParagraph = document.getElementById('paragraph').value;
    const selectedTime = document.getElementById('time').value;
    if (!testType || !selectedParagraph || !selectedTime) {
        alert("Please select test type, paragraph, and time to start.");
        return false;
    }
    localStorage.setItem('selectedParagraph', selectedParagraph);
    localStorage.setItem('selectedTime', selectedTime);
    console.log('Selected time:', selectedTime);

    if (testType === 'Hindi') {
        window.location.href = 'HindiTest.html';
    } else if (testType === 'English') {
        window.location.href = 'EnglishTest.html';
    } else if (testType === 'Remington Gail') {
        window.location.href = 'ReemintangillTest.html';
    }
    return false; // Prevent form submission
}
document.getElementById('typingForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form values
    var name = document.getElementById('name').value.trim();
    var time = document.getElementById('time').value.trim();
    var test = document.getElementById('test').value.trim();
    var paragraph = document.getElementById('paragraph').value.trim();

    // Check if all required fields are filled
    if (name === '' || time === '' || test === '' || paragraph === '') {
        alert('Please fill in all fields.');
        return;
    }

    fetch('/TypingTest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            time: time+" minute(s)",
            test: test,
            paragraph: paragraph
        })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        // Handle the response if needed
    })
    .catch(error => console.error('Error:', error));

    var url = '';

    switch(test) {
        case 'Hindi':
            url = '../HindiTest/HindiTest.html';
            break;
        case 'English':
            url = '../EnglishTest/EnglishTest.html';
            break;
        case 'Remington Gail':
            url = '../ReemintangillTest/ReemintangillTest.html';
            break;
        default:
            alert('Invalid test type.');
            return; // Exit the function if no valid test type is selected
    }

    if (url) {
        // Append the name and test as URL parameters
        url += '?name=' + encodeURIComponent(name) + '&test=' + encodeURIComponent(test) + '&time=' + encodeURIComponent(time);
        window.location.href = url; // Redirect to the selected test page
    }
});


//Time Dropdown
function populateTimeOptions(){
    const timeSelect = document.getElementById('time');
    timeSelect.innerHTML = '<option value="" disabled selected>Select time</option>';

    const timeOptions = [1, 5, 10, 15, 30, 35, 60]; // Time options in minutes

    timeOptions.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = `${time} minutes`;
        timeSelect.appendChild(option);
    });
}