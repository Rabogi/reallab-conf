document.addEventListener('DOMContentLoaded', async function () {
    const host_container = document.getElementById('hostcard-container-div');

    // Fetch data from /interfaces and populate the table
    async function fetchInterfaces() {
        try {
            const response = await fetch('/interfaces');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching interfaces:', error);
        }
    }

    async function populateInterfaces() {
        let data = await fetchInterfaces();
        let output = ''
        for (const key in data){
            output += '<div class="hostcard-indicator p-2"><span>'+key+'</span><span>'+String(data[key])+'</span></div>'
        }
        host_container.innerHTML = output;
    }

    await populateInterfaces();
    setInterval(populateInterfaces, 5000);
})


