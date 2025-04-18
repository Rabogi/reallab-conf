var suggestionsList;

fetch('/dcon/get_ports')
    .then(response => response.json())
    .then(data => suggestionsList = data)
    .catch(error => console.error('Error:', error));

const portField = document.getElementById('port-selector');
const suggestionsContainer = document.getElementById('port-suggestions');

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

// Event listener for clicking on a suggestion
suggestionsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-item')) {
        portField.value = e.target.textContent;
        suggestionsContainer.style.display = 'none';
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function (e) {
    if (e.target !== portField) {
        suggestionsContainer.style.display = 'none';
    }
});