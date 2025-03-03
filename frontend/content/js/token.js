document.addEventListener('DOMContentLoaded', function () {
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
                    if (data.status == "Fail") {
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
        fetch('/session', {
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
            .then(session => {
                if (session.username) {
                    document.getElementById('navbar-username').textContent = session.username;
                    document.getElementById('navbar-username').style.display = "block";
                    document.getElementById('navbar-logout').style.display = "block";
                } else {
                    document.getElementById('navbar-username').textContent = "Failed to load username";
                    throw new Error('No token received');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // console.error('Status', data.status);

            });
    }
});

async function logout() {
    sessionKey = window.localStorage.getItem("real_lab_conf");
    const response = await fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_token: sessionKey,
        }),
    });
}

document.getElementById("navbar-logout").onclick = () => logout();