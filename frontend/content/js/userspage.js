const sessionKey = localStorage.getItem("real_lab_conf"); // Replace with your session key
const delete_button_html = '<img class="svg_inverse" src="/content/icons/trash.svg" height="20" width="20"></a>';
const save_button_html = '<img class="svg_inverse" src="/content/icons/floppy.svg" height="20" width="20"></a>';
const edit_button_html = '<img class="svg_inverse" src="/content/icons/pencil.svg" height="20" width="20"></a>';
const cancel_button_html = '<img class="svg_inverse" src="/content/icons/x-lg.svg" height="20" width="20"></a>';

// Track the original state of the row during editing
let originalRowState = null;

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
        actionCell.className = 'action_cell';

        // Edit link
        const editLink = document.createElement('a');
        editLink.href = '#';
        editLink.innerHTML = edit_button_html; // Add your icon here
        editLink.className = 'btn btn-warning btn-sm m-1';
        editLink.onclick = () => editUser(row);
        actionCell.appendChild(editLink);

        // Delete link
        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        deleteLink.innerHTML = delete_button_html; // Add your icon here
        deleteLink.className = 'btn btn-danger btn-sm m-1';
        deleteLink.onclick = () => deleteUser(user.id);
        actionCell.appendChild(deleteLink);
    });
}

// Validate additional_info JSON and check for level field
function validateAdditionalInfo(additional_info) {
    try {
        // Parse the additional_info string into a JSON object
        const additionalData = JSON.parse(additional_info);

        // Check if the level field exists
        if (additionalData.level === undefined) {
            throw new Error('The additional_info JSON must contain a "level" field.');
        }

        // Return the parsed JSON object
        return additionalData;
    } catch (error) {
        // If parsing fails or level field is missing, show an error message
        alert(`Invalid additional_info: ${error.message}`);
        return null;
    }
}

// Display server response in the server-response-block
function displayServerResponse(status, message) {
    const responseBlock = document.getElementById('server-response-block');
    responseBlock.textContent = message; // Display the message
    responseBlock.className = `alert ${status === 'success' ? 'alert-success' : 'alert-danger'}`; // Set the alert style
}

// Add a new user
async function addUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const additional_info = document.getElementById('additional_info').value;

    if (!username || !password || !additional_info) {
        alert('Заполните все поля!');
        return;
    }

    // Validate additional_info
    const validatedAdditionalInfo = validateAdditionalInfo(additional_info);
    if (!validatedAdditionalInfo) {
        return; // Stop if validation fails
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
                    additional_info: JSON.stringify(validatedAdditionalInfo), // Convert back to string
                },
            }),
        });

        const result = await response.json();
        displayServerResponse(result.status, result.message);

        if (result.status === 'Success') {
            fetchUsers(); // Refresh the table
        }
    } catch (error) {
        console.error('Error adding user:', error);
        displayServerResponse('error', 'Failed to add user. Please try again.');
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

        const result = await response.json();
        displayServerResponse(result.status, result.message);

        if (result.status === 'Success') {
            fetchUsers(); // Refresh the table
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        displayServerResponse('error', 'Failed to delete user. Please try again.');
    }
}

// Enable editing for a row
function editUser(row) {
    const cells = row.cells;

    // Save the original state of the row
    originalRowState = {
        username: cells[1].textContent,
        password: cells[2].textContent,
        additional_info: cells[3].textContent,
    };

    // Toggle between text and input fields
    for (let i = 1; i < cells.length - 1; i++) {
        const cell = cells[i];
        const currentValue = cell.textContent;
        cell.innerHTML = `<input type="text" class="editable-input" value="${currentValue.replace(/"/g, '&quot;')}">`;
    }

    // Change the Edit link to a Save link
    const editLink = row.querySelector('a.btn-warning');
    editLink.innerHTML = save_button_html; // Change icon and text
    editLink.className = 'btn btn-success btn-sm m-1'; // Make the Save button green
    editLink.onclick = () => saveUser(row);

    // Add a Cancel link
    const cancelLink = document.createElement('a');
    cancelLink.href = '#';
    cancelLink.innerHTML = cancel_button_html; // Add your icon here
    cancelLink.className = 'btn btn-secondary btn-sm m-1';
    cancelLink.onclick = () => cancelEdit(row);
    row.cells[4].appendChild(cancelLink);
}

// Save changes for a row
async function saveUser(row) {
    const cells = row.cells;
    const userId = cells[0].textContent; // Locked ID column

    // Prepare updated user data
    const updatedUser = {
        id: userId,
        username: cells[1].querySelector('input').value,
        password: cells[2].querySelector('input').value === '***' ? '***' : CryptoJS.SHA512(cells[2].querySelector('input').value).toString(),
        additional_info: cells[3].querySelector('input').value, // Treat additional_info as a string
    };

    // Validate additional_info
    const validatedAdditionalInfo = validateAdditionalInfo(updatedUser.additional_info);
    if (!validatedAdditionalInfo) {
        return; // Stop if validation fails
    }

    // Update the additional_info with validated JSON
    updatedUser.additional_info = JSON.stringify(validatedAdditionalInfo);

    if (!updatedUser.username || updatedUser.password == 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'  || !updatedUser.additional_info) {
        alert('Пустые поля в данных не разрешены!');
        return;
    }

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

        const result = await response.json();
        displayServerResponse(result.status, result.message);

        if (result.re_log === true) {
            window.location.href = '/';
            alert("Данные успешно изменены. Войдите заново.");
        }

        if (result.status === 'Success') {
            fetchUsers(); // Refresh the table
        }
    } catch (error) {
        console.error('Error updating user:', error);
        displayServerResponse('error', 'Failed to update user. Please try again.');
    }
}

// Cancel editing and revert to the original state
function cancelEdit(row) {
    if (originalRowState) {
        // Revert the row to its original state
        row.cells[1].textContent = originalRowState.username;
        row.cells[2].textContent = originalRowState.password;
        row.cells[3].textContent = originalRowState.additional_info;

        // Change the Save link back to Edit
        const editLink = row.querySelector('a.btn-success');
        editLink.innerHTML = edit_button_html; // Change icon and text back
        editLink.className = 'btn btn-warning btn-sm m-1'; // Revert to the original style
        editLink.onclick = () => editUser(row);

        // Remove the Cancel link
        const cancelLink = row.querySelector('a.btn-secondary');
        if (cancelLink) {
            cancelLink.remove();
        }

        // Reset the originalRowState
        originalRowState = null;
    }
}

// Fetch users when the page loads
fetchUsers();
// document.getElementById("additional_info").value = '{"level":0}'