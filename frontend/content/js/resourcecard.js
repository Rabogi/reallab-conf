async function normal_fetch(method,url,headers,body){
    response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
    data = response.json();
    return data;
}

async function get_update() {
    // response = await fetch('/resources', {
    //     method: 'Post',
    //     headers: {
    //         'Content-Type': "application/json",
    //     },
    //     body: JSON.stringify({ session_token: localStorage.getItem("real_lab_conf") })
    // });
    data = await normal_fetch('POST','/resources',{
        'Content-Type':'application/json'
    },{
        session_token: localStorage.getItem("real_lab_conf")
    });
    return data;
}

timeout = 5000;

async function startUpdates() {
    for (let i = 0; ;) {
        data = await get_update()
        console.log(data)
        document.getElementById("rescard-processes").textContent = data.all_procs;
        document.getElementById("rescard-load").textContent = data.load1;
        document.getElementById("rescard-temps").textContent = String(data.temp) + "°C";
        document.getElementById("rescard-ram").textContent = String(data.available) + "/" + String(data.total) ;
        await new Promise(r => setTimeout(r, timeout));
    }
}

startUpdates();