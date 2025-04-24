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

async function flashGreen(elements) {
    // Store original background colors
    const originalColors = [];

    // Set elements to green with smooth transition
    elements.forEach((el, i) => {
        originalColors[i] = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
        el.style.transition = 'background-color 0.5s ease';
        el.style.backgroundColor ='rgb(27, 207, 123)';
    });

    // After 5 seconds, transition back to original colors
    setTimeout(() => {
        elements.forEach((el, i) => {
            el.style.backgroundColor = originalColors[i];

            // Remove transition after it's done to avoid affecting other style changes
            setTimeout(() => {
                el.style.transition = '';
            }, 500);
        });
    }, 1000);
}

async function flash(elements,color,time) {
    // Store original background colors
    const originalColors = [];

    // Set elements to green with smooth transition
    elements.forEach((el, i) => {
        originalColors[i] = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
        el.style.transition = 'background-color 0.5s ease';
        el.style.backgroundColor = color;
    });

    // After 5 seconds, transition back to original colors
    setTimeout(() => {
        elements.forEach((el, i) => {
            el.style.backgroundColor = originalColors[i];

            // Remove transition after it's done to avoid affecting other style changes
            setTimeout(() => {
                el.style.transition = '';
            }, 500);
        });
    }, time);
}

// Usage example: flash all elements with class 'flash-me'
const elementsToFlash = document.querySelectorAll('.flash-me');
flashGreen(elementsToFlash);

fetch('/dcon/get_ports')
    .then(response => response.json())
    .then(data => suggestionsList = data)
    .catch(error => console.error('Error:', error));

const baudrates = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]

const portField = document.getElementById('port-selector');
const idField = document.getElementById('dcon-id');
const baudField = document.getElementById('dcon-baudrate');
const protocolField = document.getElementById('dcon-protocol');

const suggestionsContainer = document.getElementById('port-suggestions');
const suggestionsContainer2 = document.getElementById('baud-suggestions');
const suggestionsContainer3 = document.getElementById('protocol-suggestions');

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

function showSuggestions3(suggestions) {
    if (suggestions.length === 0) {
        suggestionsContainer3.style.display = 'none';
        return;
    }

    const suggestionsHTML = suggestions.map(item =>
        `<div class="suggestion-item">${item}</div>`
    ).join('');

    suggestionsContainer3.innerHTML = suggestionsHTML;
    suggestionsContainer3.style.display = 'block';
    suggestionsContainer3.style.overflow = 'auto';
    suggestionsContainer3.style.maxHeight = '100px'
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

protocolField.addEventListener('input', function () {
    const userInput = portField.value;
    const filteredSuggestions = ["Modbus", "DCON"];
    showSuggestions3(filteredSuggestions);
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

suggestionsContainer3.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-item')) {
        protocolField.value = e.target.textContent;
        suggestionsContainer3.style.display = 'none';
    }
});


// Hide suggestions when clicking outside
document.addEventListener('click', function (e) {
    if (e.target !== portField) {
        suggestionsContainer.style.display = 'none';
    }
    if (e.target !== baudField) {
        suggestionsContainer2.style.display = 'none';
    }
    if (e.target !== protocolField) {
        suggestionsContainer3.style.display = 'none';
    }
});

scanButton.addEventListener('click', async function () {
    let a = await normal_fetch("POST", "/dcon/get_config", { 'Content-Type': 'application/json' }, {
        "session_token": localStorage.getItem("real_lab_conf"),
        "port": portField.value,
        "baudrate": 9600,
        "id": 1
    });
    console.log(a);
    if (a.status === "success") {
        idField.value = a.id;
        baudField.value = a.baudrate;
        protocolField.value = a.protocol;
        flashGreen([idField,baudField,protocolField])
    }
    else if (a.status === "fail") {
        alert(a.message);
    }
})

sendButton.addEventListener("click", async function () {
    let config = {}
    config.new_id = parseInt(idField.value,10);
    config.new_baudrate = parseInt(baudField.value,10);
    config.new_protocol = protocolField.value;
    if (config.new_id != "" && config.new_baudrate != "" && config.new_protocol != ""){
        let errorfields = []
        let errortext = "Ошибка, в полях ввода недопустимые данные."
        if (config.new_id >= 1 && config.new_id <= 247){
            flash([idField],'#00fa9a',2000)
        }
        else {
            errortext += "\nID должно быть числом в пределах интервала 1-247"
            errorfields.push(idField)
        }

        if (config.new_baudrate >= 1){
            flash([baudField],'#00fa9a',2000)
        }
        else {
            errortext += "\nСкорость должна быть числом больше нуля"
            errorfields.push(baudField)
        }

        if (config.new_protocol.toLowerCase == "modbus" || config.new_protocol.toLowerCase == "dcon"){
            flash([protocolField],'#00fa9a',2000)
        }
        else {
            errortext += "\nВыбран недопустимый протокол"
            errorfields.push(protocolField)
        }

        if (errorfields.length > 0){
            flash(errorfields,"#ff0000",5000)
            alert(errortext)
        }
    }   
    else{
        alert("Все поля должны быть заполнены");
        return
    }
})