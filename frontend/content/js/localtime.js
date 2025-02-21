function startUpdatingTime() {
    // Function to fetch the initial time from the API
    function fetchInitialTime() {
        fetch('/time')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(time => {
                // Remove extra double quotes from the API response
                time = time.replaceAll(/^"|"$/g, '');

                // Validate the time format (HH:MM:SS)
                if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
                    throw new Error('Invalid time format received from API');
                }

                // Update the time display
                document.getElementById('cur-time').textContent = time;

                // Start updating the time locally
                startUpdatingTimeLocally(time);
            })
            .catch(error => {
                console.error('Error fetching or parsing time:', error);
                document.getElementById('cur-time').textContent = 'Error: Unable to load time';
            });
    }

    // Function to start updating the time locally
    function startUpdatingTimeLocally(initialTime) {
        let timeParts = initialTime.split(':');
        let hours = parseInt(timeParts[0], 10);
        let minutes = parseInt(timeParts[1], 10);
        let seconds = parseInt(timeParts[2], 10);

        // Validate parsed values
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            console.error('Invalid time values:', hours, minutes, seconds);
            return;
        }

        // Update the time every second
        setInterval(() => {
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

            // Format the time as HH:MM:SS
            const formattedTime = 
                String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');

            // Update the time display
            document.getElementById('cur-time').textContent = formattedTime;
        }, 1000);
    }

    // Fetch the initial time from the API
    fetchInitialTime();
}

// Start the time update process
startUpdatingTime();