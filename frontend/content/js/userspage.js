const sessionKey = localStorage.getItem("real_lab_conf"); // Replace with your session key

// Fetch users from the server and populate the table
async function fetchUsers() {
    try {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_token: sessionKey }),
        });
        const users = await response.json();
        console.log(users);
        populateTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Populate the table with user data
function populateTable(users) {
    const tbody = document.querySelector('#userTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = user.id; // Locked column
        row.insertCell(1).textContent = user.username;
        row.insertCell(2).textContent = user.password; // Passwords are returned as ***
        row.insertCell(3).textContent = user.additional_info; // Treat additional_info as a string
        // console.log(user);

        // Add edit and delete buttons
        const actionCell = row.insertCell(4);
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'btn btn-warning btn-sm me-2';
        editButton.onclick = () => editUser(row);
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.onclick = () => deleteUser(user.id);
        actionCell.appendChild(deleteButton);
    });
}

// Add a new user
async function addUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const additional_info = document.getElementById('additional_info').value;

    if (!username || !password || !additional_info) {
        alert('Please fill all fields!');
        return;
    }

    // Hash the password using SHA-512
    const hashedPassword = CryptoJS.SHA512(password).toString();

    try {
        const response = await fetch('/add_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_token: sessionKey,
                userdata: {
                    username,
                    password: hashedPassword,
                    additional_info: additional_info, // Treat additional_info as a string
                },
            }),
        });

        if (response.ok) {
            fetchUsers(); // Refresh the table
        } else {
            console.error('Error adding user:', await response.text());
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

// Delete a user
async function deleteUser(userId) {
    try {
        const response = await fetch('/rem_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_token: sessionKey,
                userdata: { id: userId },
            }),
        });

        if (response.ok) {
            fetchUsers(); // Refresh the table
        } else {
            console.error('Error deleting user:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Edit a user
async function editUser(row) {
    const cells = row.cells;
    const userId = cells[0].textContent; // Locked ID column

    // Toggle between text and input fields
    for (let i = 1; i < cells.length - 1; i++) {
        const cell = cells[i];
        if (cell.querySelector('input')) {
            // Save the value and switch back to text
            const input = cell.querySelector('input');
            cell.textContent = input.value;
        } else {
            // Switch to input field
            const currentValue = cell.textContent;
            cell.innerHTML = `<input type="text" class="editable-input" value="${currentValue.replace(/"/g, '&quot;')}">`;
        }
    }

    // Change the button text to "Save" or "Edit"
    const editButton = row.querySelector('button');
    if (editButton.textContent === 'Edit') {
        editButton.textContent = 'Save';
    } else {
        editButton.textContent = 'Edit';

        // Prepare updated user data
        const updatedUser = {
            id: userId,
            username: cells[1].textContent,
            password: cells[2].textContent === '***' ? '***' : CryptoJS.SHA512(cells[2].textContent).toString(),
            additional_info: cells[3].textContent, // Treat additional_info as a string
        };

        // Send the updated data to the server
        try {
            const response = await fetch('/alter_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_token: sessionKey,
                    userdata: updatedUser,
                }),
            });

            if (!response.ok) {
                console.error('Error updating user:', await response.text());
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }
}

// Fetch users when the page loads
fetchUsers();