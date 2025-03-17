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
    return x.map((value, index) => ({ x: value, y: y[index], label: String(l[index]) + " сек. "}));
}

// Constants
var timeout = 1000; // 1 seconds
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
// Memory constants
var memory_data_len = 20;
var memory_time_data = createDecreasingArray(0, timeout / 1000, load_data_len);
var memory_data_axis_x = [...Array(load_data_len).keys()];
var memory_data_free = new Array(load_data_len).fill(null); // Initialize with null values
var memory_data_used = new Array(load_data_len).fill(null); // Initialize with null values
var memory_data_shared = new Array(load_data_len).fill(null); // Initialize with null values
var memory_data_buff = new Array(load_data_len).fill(null); // Initialize with null values
var memory_data_available = new Array(load_data_len).fill(null); // Initialize with null values




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
        type: "line",
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

var chart3 = new CanvasJS.Chart("memory-graph", {
    theme: "dark2",
    animationEnabled: true,
    backgroundColor: "#343542",
    title: {
        text: "Память",
        fontColor: "#ffffff"
    },
    axisX: {
        title: "Время",
        fontColor: "#ffffff"
    },
    axisY: {
        title: "МБ",
        fontColor: "#ffffff"
    },
    data: [
        {
            name: "Свободно",
            showInLegend: true,
            type: "line",
            color: "#00ff00",
            dataPoints: labeled_createPairs(memory_data_axis_x, memory_data_free, memory_time_data) // Initial data points
        }
        ,
        {
            name: "Занято",
            showInLegend: true,
            type: "line",
            color: "#ff0000",
            dataPoints: labeled_createPairs(memory_data_axis_x, memory_data_used, memory_time_data) // Initial data points
        }
        ,
        {
            name: "Разделённая",
            showInLegend: true,
            type: "line",
            color: "#ff00ff",
            dataPoints: labeled_createPairs(memory_data_axis_x, memory_data_shared, memory_time_data) // Initial data points
        }
        ,
        {
            name: "Буфер",
            showInLegend: true,
            type: "line",
            color: "#ffff00",
            dataPoints: labeled_createPairs(memory_data_axis_x, memory_data_buff, memory_time_data) // Initial data points
        }
        ,
        {
            name: "Доступно",
            showInLegend: true,
            type: "line",
            color: "#00ffff",
            dataPoints: labeled_createPairs(memory_data_axis_x, memory_data_available, memory_time_data) // Initial data points
        }   
    ]
});
chart3.render(); // Render the chart initially


// Start updates
async function startUpdates() {
    while (true) {
        let data = await get_update(); // Fetch new data

        // Update UI elements
        document.getElementById("res-processes").textContent = data.all_procs;
        document.getElementById("res-load").textContent = data.load1;
        document.getElementById("res-temps").textContent = `${data.temp}°C`;
        document.getElementById("res-ram").textContent = `${data.available}/${data.total}`;
        let perc = parseFloat(data.server_usage)/parseFloat(data.total)*100;
        document.getElementById("res-ram-server").textContent = `${data.server_usage} МБайт (${perc.toFixed(2)}%)`;

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

        chart2.options.data[0].dataPoints = load_minute_graphdata;
        chart2.options.data[1].dataPoints = load_five_graphdata;
        chart2.options.data[2].dataPoints = load_fifteen_graphdata;
        chart2.render();

        memory_data_used.shift();
        memory_data_free.shift();
        memory_data_shared.shift();
        memory_data_buff.shift();
        memory_data_available.shift();
        
        memory_data_used.push(parseFloat(data.used));
        memory_data_free.push(parseFloat(data.free));
        memory_data_shared.push(parseFloat(data.shared));
        memory_data_buff.push(parseFloat(data.buff));
        memory_data_available.push(parseFloat(data.available));
        
        chart3.options.data[0].dataPoints = labeled_createPairs(memory_data_axis_x,memory_data_used,memory_time_data);
        chart3.options.data[1].dataPoints = labeled_createPairs(memory_data_axis_x,memory_data_free,memory_time_data);
        chart3.options.data[2].dataPoints = labeled_createPairs(memory_data_axis_x,memory_data_shared,memory_time_data);
        chart3.options.data[3].dataPoints = labeled_createPairs(memory_data_axis_x,memory_data_buff,memory_time_data);
        chart3.options.data[4].dataPoints = labeled_createPairs(memory_data_axis_x,memory_data_available,memory_time_data);

        chart3.render();

        // Wait for the next update
        await new Promise(resolve => setTimeout(resolve, timeout));
    }
}

// Start the update loop
startUpdates();