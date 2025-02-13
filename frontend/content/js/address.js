async function fetch_address() {
    try {
        const response = await fetch('/eth_interfaces'); // Call your API endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text(); // Get the response as text
        return data; // Return the address string (e.g., "Wed Feb 12 11:39:24 2025")
    } catch (error) {
        console.error('Error fetching address:', error);
        return null;
    }
}

async function get_eht_address(){
    data = await fetch_address();
    if (!data) {
        document.getElementById('address').textContent = 'Failed to load address.';
        return;
    }
    document.getElementById('address').textContent = data
}

get_eht_address()
