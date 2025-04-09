function sha512(str) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
        return Array.prototype.map.call(new Uint8Array(buf), x => (('00' + x.toString(16)).slice(-2))).join('');
    });
}
document.addEventListener('DOMContentLoaded', async function () {
    const loginButton = document.querySelector('#loginButton');
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
    const messageElement = document.querySelector('#message');

    document.addEventListener("keydown", function (event) {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
            loginButton.click();
        }
    });

    loginButton.addEventListener('click', async function () {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            messageElement.textContent = 'Please enter both username and password.';
            return;
        }

        await sha512(password).then(result => { hash = result })

        // Send a POST request to the server
        fetch('/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: hash
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                if (data.session_token) {
                    // Save the token to local storage
                    localStorage.setItem('real_lab_conf', data.session_token);
                    messageElement.textContent = 'Login successful!';
                    // Redirect or perform other actions after successful login
                    window.location.href = '/dashboard'; // Example redirect
                } else {
                    throw new Error('No token received');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                messageElement.textContent = 'Login failed. Please check your credentials.';
            });
    });
});