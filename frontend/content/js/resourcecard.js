// Fetch function
async function normal_fetch(method, url, headers, body) {
    let response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
    let data = await response.json(); // Add await here
    return data;
}

// Fetch update function
async function get_update() {
    let data = await normal_fetch('POST', '/resources', {
        'Content-Type': 'application/json'
    }, {
        session_token: localStorage.getItem("real_lab_conf")
    });
    return data;
}

// Create a decreasing array
function createDecreasingArray(startValue, decrementValue, numberOfElements) {
    return Array.from({ length: numberOfElements }, (_, i) => startValue - i * decrementValue).reverse();
}

// Create pairs of { x, y }
function createPairs(x, y) {
    return x.map((value, index) => ({ x: value, y: y[index] }));
}

// Create labeled pairs of { x, y , label}
function labeled_createPairs(x, y, l) {
    return x.map((value, index) => ({ x: value, y: y[index] , label:l[index] }));
}

// Constants
var timeout = 5000; // 5 seconds
var temp_data_len = 20;
var temp_time_data = createDecreasingArray(0, timeout / 5000, temp_data_len);
var temp_data_axis_x = [...Array(temp_data_len).keys()]; // [0, 1, 2, ..., 19]
var temp_data = new Array(temp_data_len).fill(null); // Initialize with null values

// Initialize CanvasJS Chart
var chart = new CanvasJS.Chart("temp-graph", {
    theme: "dark2",
    animationEnabled: true,
    title: {
        text: "CPU temperature"
    },
    axisX: {
        title: "Time"
        
    },
    axisY: {
        title: "Temperature (°C)"
    },
    data: [{
        type: "line",
        dataPoints: labeled_createPairs(temp_data_axis_x, temp_data, temp_time_data) // Initial data points
    }]
});
chart.render(); // Render the chart initially

// Start updates
async function startUpdates() {
    while (true) {
        let data = await get_update(); // Fetch new data

        // Update UI elements
        document.getElementById("rescard-processes").textContent = data.all_procs;
        document.getElementById("rescard-load").textContent = data.load1;
        document.getElementById("rescard-temps").textContent = `${data.temp}°C`;
        document.getElementById("rescard-ram").textContent = `${data.available}/${data.total}`;

        // Update temperature data
        temp_data.shift(); // Remove the oldest data point
        temp_data.push(data.temp); // Add the new temperature value

        // Update chart data
        let graph_data = labeled_createPairs(temp_data_axis_x, temp_data, temp_time_data); // Create new pairs
        chart.options.data[0].dataPoints = graph_data; // Update dataPoints
        chart.render(); // Re-render the chart

        // Wait for the next update
        await new Promise(resolve => setTimeout(resolve, timeout));
    }
}

// Start the update loop
startUpdates();