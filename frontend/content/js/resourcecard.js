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
    return x.map((value, index) => ({ x: value, y: y[index], label: l[index] }));
}

// Constants
var timeout = 5000; // 5 seconds
// Temps constants
var temp_data_len = 20;
var temp_time_data = createDecreasingArray(0, timeout / 1000, temp_data_len);
var temp_data_axis_x = [...Array(temp_data_len).keys()];
var temp_data = new Array(temp_data_len).fill(null); // Initialize with null values
// Load constants
var load_data_len = 20;
var load_time_data = createDecreasingArray(0, timeout / 1000, load_data_len);
var load_data_axis_x = [...Array(load_data_len).keys()];
var load_minute_data = new Array(load_data_len).fill(null); // Initialize with null values
var load_five_data = new Array(load_data_len).fill(null); // Initialize with null values
var load_fifteen_data = new Array(load_data_len).fill(null); // Initialize with null values



// Initialize CanvasJS Temp Chart
var chart = new CanvasJS.Chart("temp-graph", {
    theme: "dark2",
    animationEnabled: true,
    backgroundColor: "#343542",
    title: {
        text: "Температура ЦПУ",
        fontColor: "#ffffff"
    },
    axisX: {
        title: "Время",
        fontColor: "#ffffff"
    },
    axisY: {
        title: "Температура (°C)",
        fontColor: "#ffffff"
    },
    data: [{
        name: "CPU температура",
        showInLegend: true,
        type: "spline",
        color: "#ff0000",
        dataPoints: labeled_createPairs(temp_data_axis_x, temp_data, temp_time_data) // Initial data points
    }]
});
chart.render(); // Render the chart initially

// Initialize CanvasJS Temp Chart
var chart2 = new CanvasJS.Chart("load-graph", {
    theme: "dark2",
    animationEnabled: true,
    backgroundColor: "#343542",
    title: {
        text: "Нагрузка на ЦПУ",
        fontColor: "#ffffff"
    },
    axisX: {
        title: "Время",
        fontColor: "#ffffff"
    },
    axisY: {
        title: "Нагрузка",
        fontColor: "#ffffff"
    },
    data: [
        {
            name: "За 1 минуту",
            showInLegend: true,
            type: "spline",
            color: "#ff0000",
            dataPoints: labeled_createPairs(load_data_axis_x, load_minute_data, load_time_data) // Initial data points
        }
        ,
        {
            name: "За 5 минут",
            showInLegend: true,
            type: "spline",
            color: "#00ff00",
            dataPoints: labeled_createPairs(load_data_axis_x, load_five_data, load_time_data) // Initial data points
        }
        ,
        {
            name: "За 15 минут",
            color: "#0000ff",
            showInLegend: true,
            type: "spline",
            dataPoints: labeled_createPairs(load_data_axis_x, load_fifteen_data, load_time_data) // Initial data points
        }
    ]
});
chart2.render(); // Render the chart initially

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

        load_minute_data.shift();
        load_five_data.shift();
        load_fifteen_data.shift();
        load_minute_data.push(parseFloat(data.load1));
        load_five_data.push(parseFloat(data.load5));
        load_fifteen_data.push(parseFloat(data.load15));

        // Update chart data
        let graph_data = labeled_createPairs(temp_data_axis_x, temp_data, temp_time_data); // Create new pairs
        chart.options.data[0].dataPoints = graph_data; // Update dataPoints
        chart.render(); // Re-render the chart

        let load_minute_graphdata = labeled_createPairs(load_data_axis_x, load_minute_data, load_time_data);
        let load_five_graphdata = labeled_createPairs(load_data_axis_x, load_five_data, load_time_data);
        let load_fifteen_graphdata = labeled_createPairs(load_data_axis_x, load_fifteen_data, load_time_data);

        console.log("Minute Data:", load_minute_data);
        console.log("Five Data:", load_five_data);
        console.log("Fifteen Data:", load_fifteen_data);
        console.log("Time Data:", load_time_data);

        chart2.options.data[0].dataPoints = load_minute_graphdata;
        chart2.options.data[1].dataPoints = load_five_graphdata;
        chart2.options.data[2].dataPoints = load_fifteen_graphdata;
        chart2.render();


        // Wait for the next update
        await new Promise(resolve => setTimeout(resolve, timeout));
    }
}

// Start the update loop
startUpdates();