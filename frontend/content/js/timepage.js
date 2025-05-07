var suggestionsList;

fetch('/timezones')
    .then(response => response.json())
    .then(data => suggestionsList = data)
    .catch(error => console.error('Error:', error));


// Get references to the input field and suggestions container
const timezonechangefield = document.getElementById('timezone-change-field');
const suggestionsContainer = document.getElementById('suggestions');

const recommended_switch = document.getElementById('time-recommended');
const ntp_sync_switch = document.getElementById('ntp-sync');
const rtclocal_switch = document.getElementById('local-rtc');

// Function to filter suggestions based on user input
function getSuggestions(input) {
    return suggestionsList.filter(item =>
        item.toLowerCase().startsWith(input.toLowerCase())
    ).slice(0, 5);
}

timezonechangefield.addEventListener("input", () => {
    let options = getSuggestions(timezonechangefield.value);
    if (options.length > 0) {
        suggestionsContainer.innerHTML = '';
        options.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            suggestionsContainer.appendChild(option);
        });
    }
})


// // Function to display suggestions
// function showSuggestions(suggestions) {
//     if (suggestions.length === 0) {
//         suggestionsContainer.style.display = 'none';
//         return;
//     }

//     const suggestionsHTML = suggestions.map(item =>
//         `<div class="suggestion-item">${item}</div>`
//     ).join('');

//     suggestionsContainer.innerHTML = suggestionsHTML;
//     suggestionsContainer.style.display = 'block';
//     suggestionsContainer.style.overflow = 'auto';
//     suggestionsContainer.style.maxHeight = '200px'
// }

// // Event listener for input field
// timezonechangefield.addEventListener('input', function () {
//     const userInput = timezonechangefield.value;
//     const filteredSuggestions = getSuggestions(userInput);
//     showSuggestions(filteredSuggestions);
// });

// // Event listener for clicking on a suggestion
// suggestionsContainer.addEventListener('click', function (e) {
//     if (e.target.classList.contains('suggestion-item')) {
//         timezonechangefield.value = e.target.textContent;
//         suggestionsContainer.style.display = 'none';
//     }
// });

// // Hide suggestions when clicking outside
// document.addEventListener('click', function (e) {
//     if (e.target !== timezonechangefield) {
//         suggestionsContainer.style.display = 'none';
//     }
// });

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
let time_change_perm = false;

let time_settings = {
    "localtime": "",
    "timezone": "",
    "date": "",
    "rtclocal": "",
    "ntp": "",
}

let settings = {
    "timezone-button": document.getElementById("button-save-timezone"),
    "timezone-field": document.getElementById("timezone-change-field"),
    "localtime-button": document.getElementById("button-save-localtime"),
    "localtome-field": document.getElementById("time-change-field"),
    "date-button": document.getElementById("button-save-date"),
    "date-field": document.getElementById("date-change-field"),
    "switch-recommended": document.getElementById("time-recommended"),
    "switch-time-sync": document.getElementById("sync-status"),
    "switch-local-rtc": document.getElementById("local-rtc"),
    "ntp-sync": document.getElementById("ntp-sync"),
}

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
                document.getElementById("sync-status").textContent = data.sys_clock_sync;
                

                update_settings(data);

                if (data.time_change) {
                    for (let key in settings) {
                        if (settings.hasOwnProperty(key)) {
                            settings[key].disabled = false;
                        }
                    }
                }
            }
            else {
                throw new Error('No time data received');
            }
        })
}

function update_settings(data) {
    time_settings["date"] = data.date;
    time_settings["localtime"] = data.local;
    time_settings["timezone"] = data.timezone;
    time_settings["rtclocal"] = data.rtc_equal_tz
    time_settings["ntp"] = data.ntp;
    settings["switch-local-rtc"].checked = time_settings["rtclocal"];
    settings["ntp-sync"].checked = time_settings["ntp"];

    if (time_settings["rtclocal"] == false & time_settings["ntp"] == true) {
        recommended_switch.checked = true;
    }
    else
    {
        recommended_switch.checked = false;
    }
}

const timezone_button = document.getElementById("button-save-timezone")
const save_time_button = document.getElementById("button-save-localtime")
const save_date_button = document.getElementById("button-save-date")

timezone_button.addEventListener('click',async function () {
    var input = document.getElementById("timezone-change-field").value;
    await send_settings({
        timezone: input,
    })
    get_timedatectl()
});

save_time_button.addEventListener('click',async function () {
    var input = document.getElementById("time-change-field").value;
    await send_settings({
        localtime: input,
    })
    get_timedatectl()
});

save_date_button.addEventListener('click',async function () {
    var input = document.getElementById("date-change-field").value;
    await send_settings({
        date: input,
    })
    get_timedatectl()
});


recommended_switch.addEventListener('click', async function () {
    if (recommended_switch.checked) {
        time_settings["rtclocal"] = false;
        time_settings["ntp"] = true;
        await send_settings({
            ntp: time_settings["ntp"],
            rtclocal: time_settings["rtclocal"],
        })
        get_timedatectl()
    } else {
    }
});

ntp_sync_switch.addEventListener('click', async function () {
    if (ntp_sync_switch.checked) {
        time_settings["ntp"] = true;
        await send_settings({
            ntp: time_settings["ntp"],});
        get_timedatectl()
    } else {
        time_settings["ntp"] = false;
        await send_settings({
            ntp: time_settings["ntp"],});
        get_timedatectl()
    }
});

rtclocal_switch.addEventListener('click', async function () {
    if (rtclocal_switch.checked) {
        time_settings["rtclocal"] = true;
        await send_settings({
            rtclocal: time_settings["rtclocal"],
        })
        get_timedatectl()
    } else {
        time_settings["rtclocal"] = false;
        await send_settings({
            rtclocal: time_settings["rtclocal"],
        })
        get_timedatectl()
    }
});


async function send_settings(data) {
    const response = await fetch('/settings/time/values', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_token: session_token,
            data : JSON.stringify(data)
        }),
    }).then(response => {
        if (!response.ok) {
            throw new Error('Token failed');
        }
        return response.json();
    })
        .then(r => {
            if (r.status = "success") {
                return r;
            }
            else {
                throw new Error('No response received');
            }
        })
}

get_timedatectl()
setInterval(() => {
    document.getElementById("local-time").textContent = update_time(document.getElementById("local-time").textContent);
    document.getElementById("UTC-time").textContent = update_time(document.getElementById("UTC-time").textContent);
    document.getElementById("RTC-time").textContent = update_time(document.getElementById("RTC-time").textContent);
}, 1000);