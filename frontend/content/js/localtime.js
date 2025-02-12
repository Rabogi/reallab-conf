// Function to fetch time from the API
async function fetchTime() {
    try {
        const response = await fetch('/time'); // Call your API endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text(); // Get the response as text
        return data; // Return the time string (e.g., "Wed Feb 12 11:39:24 2025")
    } catch (error) {
        console.error('Error fetching time:', error);
        return null;
    }
}

// Function to extract time from the API response and start updating it
async function initializeTime() {
    const timeString = await fetchTime(); // Fetch the initial time
    if (!timeString) {
        document.getElementById('time').textContent = 'Failed to load time.';
        return;
    }

    // Extract the time portion (e.g., "11:39:24")
    const timePart = timeString.split(' ')[3];

    // Parse the time into hours, minutes, and seconds
    let [hours, minutes, seconds] = timePart.split(':').map(Number);

    // Function to update the time every second
    function updateTime() {
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
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update the HTML
        document.getElementById('time').textContent = formattedTime;
    }
    // Update the time immediately
    updateTime();

    // Update the time every second
    setInterval(updateTime, 1000);
}

// Initialize the time
initializeTime();