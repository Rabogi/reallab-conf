var suggestionsList;

fetch('/timezones')
    .then(response => response.json())
    .then(data => suggestionsList = data)
    .catch(error => console.error('Error:', error));


// Get references to the input field and suggestions container
const timezonechangefield = document.getElementById('timezone-change-field');
const suggestionsContainer = document.getElementById('suggestions');

// Function to filter suggestions based on user input
function getSuggestions(input) {
    return suggestionsList.filter(item =>
        item.toLowerCase().startsWith(input.toLowerCase())
    ).slice(0, 20);
}

// Function to display suggestions
function showSuggestions(suggestions) {
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const suggestionsHTML = suggestions.map(item =>
        `<div class="suggestion-item">${item}</div>`
    ).join('');

    suggestionsContainer.innerHTML = suggestionsHTML;
    suggestionsContainer.style.display = 'block';
    suggestionsContainer.style.overflow = 'auto';
    suggestionsContainer.style.maxHeight = '200px'
}

// Event listener for input field
timezonechangefield.addEventListener('input', function () {
    const userInput = timezonechangefield.value;
    const filteredSuggestions = getSuggestions(userInput);
    showSuggestions(filteredSuggestions);
});

// Event listener for clicking on a suggestion
suggestionsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-item')) {
        timezonechangefield.value = e.target.textContent;
        suggestionsContainer.style.display = 'none';
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function (e) {
    if (e.target !== timezonechangefield) {
        suggestionsContainer.style.display = 'none';
    }
});

function update_time(time) {
    let timeParts = time.split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = parseInt(timeParts[2], 10);

    // Validate parsed values
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        console.error('Invalid time values:', hours, minutes, seconds);
        return;
    }
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
            if (hours >= 24) {
                hours = 0;
            }
        }
    }

    const formattedTime =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    return formattedTime;
}

let session_token = localStorage.getItem("real_lab_conf");

function get_timedatectl() {
    fetch('/timedatectl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_token: session_token,
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token failed');
            }
            return response.json();
        })
        .then(data => {
            if (data.local) {
                document.getElementById("local-time").textContent = data.local;
                document.getElementById("UTC-time").textContent = data.utc;
                document.getElementById("RTC-time").textContent = data.rtc;
                document.getElementById("local-TZ").textContent = data.timezone;
                document.getElementById("local-date").textContent = data.day + "." + data.month + "." + data.year;
                document.getElementById("timezone-change-field").value = data.timezone;
                setInterval(() => {
                    document.getElementById("local-time").textContent = update_time(document.getElementById("local-time").textContent);
                    document.getElementById("UTC-time").textContent = update_time(document.getElementById("UTC-time").textContent);
                    document.getElementById("RTC-time").textContent = update_time(document.getElementById("RTC-time").textContent);
                }, 1000);
            }
            else {
                throw new Error('No time data received');
            }
        })
}

get_timedatectl()