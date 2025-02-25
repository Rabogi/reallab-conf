async function normal_fetch(method,url,headers,body){
    let response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
    let data = response.json();
    return data;
}

async function get_update() {
    let data = await normal_fetch('POST','/resources',{
        'Content-Type':'application/json'
    },{
        session_token: localStorage.getItem("real_lab_conf")
    });
    return data;
}

function createDecreasingArray(startValue, decrementValue, numberOfElements) {
    return Array.from({ length: numberOfElements }, (_, i) => startValue - i * decrementValue).reverse();
}

var timeout = 5000;
var temp_data_len = 20;
var temp_time_data = new createDecreasingArray(0,timeout/5000,temp_data_len)
var temp_data = new Array(temp_data_len).fill(0);
var temp_graph = document.getElementById("temp-graph");
Plotly.react(temp_graph,[{
    x : temp_time_data,
    y : temp_data,
}])


async function startUpdates() {
    for (let i = 0; ;) {
        let data = await get_update()
        console.log(data)
        document.getElementById("rescard-processes").textContent = data.all_procs;
        document.getElementById("rescard-load").textContent = data.load1;
        document.getElementById("rescard-temps").textContent = String(data.temp) + "°C";
        document.getElementById("rescard-ram").textContent = String(data.available) + "/" + String(data.total) ;

        temp_data.shift()
        temp_data.push(data.temp)
        console.log(temp_data)

        Plotly.react(temp_graph,[{
            x : temp_time_data,
            y : temp_data,
        }])
        await new Promise(r => setTimeout(r, timeout));
    }
}
startUpdates();