var suggestionsList;

async function normal_fetch(method, url, headers, body) {
    let response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
    let data = await response.json(); // Add await here
    return data;
}

fetch('/dcon/get_ports')
    .then(response => response.json())
    .then(data => suggestionsList = data)
    .catch(error => console.error('Error:', error));

const baudrates = [1200,2400,4800,9600,19200,38400,57600,115200]

const portField = document.getElementById('port-selector');
const idField = document.getElementById('dcon-id');
const baudField = document.getElementById('dcon-baudrate');
const protocolField = document.getElementById('dcon-protocol');

const suggestionsContainer = document.getElementById('port-suggestions');
const suggestionsContainer2 = document.getElementById('baud-suggestions');

const scanButton = document.getElementById("dcon-scan");
const sendButton = document.getElementById("dcon-send");

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
    suggestionsContainer.style.maxHeight = '100px'
};

function showSuggestions2(suggestions) {
    if (suggestions.length === 0) {
        suggestionsContainer2.style.display = 'none';
        return;
    }

    const suggestionsHTML = suggestions.map(item =>
        `<div class="suggestion-item">${item}</div>`
    ).join('');

    suggestionsContainer2.innerHTML = suggestionsHTML;
    suggestionsContainer2.style.display = 'block';
    suggestionsContainer2.style.overflow = 'auto';
    suggestionsContainer2.style.maxHeight = '100px'
};

function getSuggestions(input) {
    return suggestionsList.filter(item =>
        item.toLowerCase().startsWith(input.toLowerCase())
    ).slice(0, 20);
}

// Event listener for input field
portField.addEventListener('input', function () {
    const userInput = portField.value;
    const filteredSuggestions = getSuggestions(userInput);
    showSuggestions(filteredSuggestions);
});

baudField.addEventListener('input', function () {
    const userInput = portField.value;
    const filteredSuggestions = baudrates;
    showSuggestions2(filteredSuggestions);
});

// Event listener for clicking on a suggestion
suggestionsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-item')) {
        portField.value = e.target.textContent;
        suggestionsContainer.style.display = 'none';
    }
});

suggestionsContainer2.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-item')) {
        baudField.value = e.target.textContent;
        suggestionsContainer2.style.display = 'none';
    }
});


// Hide suggestions when clicking outside
document.addEventListener('click', function (e) {
    if (e.target !== portField) {
        suggestionsContainer.style.display = 'none';
    }
    if (e.target !== portField) {
        suggestionsContainer2.style.display = 'none';
    }
});

scanButton.addEventListener('click', async function () {
    await normal_fetch("POST","/dcon/get_config");
})