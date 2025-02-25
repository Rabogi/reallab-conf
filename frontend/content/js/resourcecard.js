
async function get_update() {
    response = await fetch('/resources', {
        method: 'Post',
        headers: {
            'Content-Type': "application/json",
        },
        body: JSON.stringify({ session_token: localStorage.getItem("real_lab_conf") })
    });
    data = response.json();
    return data;
}

timeout = 1000;

async function startUpdates() {
    for (let i = 0; ;) {
        data = await get_update()
        console.log(data)
        await new Promise(r => setTimeout(r, timeout));
    }
}

startUpdates();