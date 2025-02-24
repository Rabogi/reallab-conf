function update_time(time) {
    let timeParts = initialTime.split(':');
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
}

session_token = localStorage.getItem("real_lab_conf");
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
            setInterval(() => {
                
            }, 1000);
        } else {
            throw new Error('No timedata received');
        }
    })