document.addEventListener('DOMContentLoaded', function() {
    // Check if the current page is the root
    if (window.location.pathname === '/') {
        console.log('This is the root page.');
        // Perform actions specific to the root page
    } else {
        session_token = localStorage.getItem("real_lab_conf");
        fetch('/login', {
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
            if (data.status) {
                if (data.status == "Fail"){
                    console.error('Error:', error);
                    console.error('Status', data.status);
                    window.location.href = '/';
                }
            } else {
                throw new Error('No token received');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // console.error('Status', data.status);
            window.location.href = '/';
        });
    }
});