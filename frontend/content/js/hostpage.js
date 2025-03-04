// script.js

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#interfaceTable tbody');
    const changeIPForm = document.getElementById('changeIPForm');
    const interfaceInput = document.getElementById('interface');
    const newIPInput = document.getElementById('newIP');

    // Fetch data from /interfaces and populate the table
    async function fetchInterfaces() {
        try {
            const response = await fetch('/interfaces');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            populateTable(data);
        } catch (error) {
            console.error('Error fetching interfaces:', error);
        }
    }

    // Populate the table with data
    function populateTable(data) {
        tableBody.innerHTML = ''; // Clear existing rows
        for (const [interfaceName, ipAddress] of Object.entries(data)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${interfaceName}</td>
                <td>${ipAddress}</td>
                <td>
                    ${interfaceName === 'lo' ? 
                        '<button disabled>Change IP</button>' : 
                        `<button onclick="fillForm('${interfaceName}', '${ipAddress}')">Change IP</button>`
                    }
                </td>
            `;
            tableBody.appendChild(row);
        }
    }

    // Fill the form with interface and current IP
    window.fillForm = function (interfaceName, currentIP) {
        interfaceInput.value = interfaceName;
        newIPInput.value = currentIP === 'None' ? '' : currentIP;
    };

    // Handle form submission to change IP
    changeIPForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const interfaceName = interfaceInput.value;
        const newIP = newIPInput.value;

        // Prevent changes to the 'lo' interface
        if (interfaceName === 'lo') {
            alert('Cannot change IP for the loopback interface (lo).');
            return;
        }

        try {
            const response = await fetch('/changeIP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interface: interfaceName, newIP }),
            });

            if (!response.ok) {
                throw new Error('Failed to change IP');
            }

            alert('IP changed successfully!');
            fetchInterfaces(); // Refresh the table
        } catch (error) {
            console.error('Error changing IP:', error);
            alert('Failed to change IP');
        }
    });

    // Initial fetch to populate the table
    fetchInterfaces();
});