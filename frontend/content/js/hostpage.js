async function normal_fetch(method, url, headers, body) {
    let response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
    let data = await response.json(); // Add await here
    return data;
}

var eth0_switch = document.getElementById("static-eth0");
var eth1_switch = document.getElementById("static-eth1");

var check_button = document.getElementById("button-check");
var save_button = document.getElementById("button-save");
var reset_button = document.getElementById("button-reset");

var dhcp_flag_eth0 = false;
var dhcp_flag_eth1 = false;

var eth0 = {
    ip: document.getElementById("eth0-ip"),
    router: document.getElementById("eth0-router"),
    dns: document.getElementById("eth0-dns"),
}

var eth1 = {
    ip: document.getElementById("eth1-ip"),
    router: document.getElementById("eth1-router"),
    dns: document.getElementById("eth1-dns"),
}

eth0_switch.addEventListener('click', async function () {
    if (eth0_switch.checked) {
        eth0.ip.disabled = false;
        eth0.router.disabled = false;
        eth0.dns.disabled = false;
        dhcp_flag_eth0 = true;
    } else {
        eth0.ip.disabled = true;
        eth0.router.disabled = true;
        eth0.dns.disabled = true;
        dhcp_flag_eth0 = false;
    }
});

eth1_switch.addEventListener('click', async function () {
    if (eth1_switch.checked) {
        eth1.ip.disabled = false;
        eth1.router.disabled = false;
        eth1.dns.disabled = false;
        dhcp_flag_eth1 = true;
    } else {
        eth1.ip.disabled = true;
        eth1.router.disabled = true;
        eth1.dns.disabled = true;
        dhcp_flag_eth1 = false;
    }
});

async function check_ips() {
    let wrong = 0
    if (dhcp_flag_eth0 == true) {
        let eth0_data = {
            ip: eth0.ip.value,
            router: eth0.router.value,
            dns: eth0.dns.value,
        }
        let result = await normal_fetch("POST", "/utils/check_ips", { 'Content-Type': 'application/json' }, {
            ...eth0_data, ...{ session_token: localStorage.getItem("real_lab_conf") }
        });
        console.log(result);
        wrong += Object.values(result).filter(val => val === false).length;
        await setRed(eth0.ip, result.ip)
        await setRed(eth0.router, result.router)
        await setRed(eth0.dns, result.dns)
    }
    if (dhcp_flag_eth1 == true) {
        let eth1_data = {
            ip: eth1.ip.value,
            router: eth1.router.value,
            dns: eth1.dns.value,
        }
        let result = await normal_fetch("POST", "/utils/check_ips", { 'Content-Type': 'application/json' }, {
            ...eth1_data, ...{ session_token: localStorage.getItem("real_lab_conf") }
        });
        console.log(result);
        wrong += Object.values(result).filter(val => val === false).length;
        await setRed(eth1.ip, result.ip)
        await setRed(eth1.router, result.router)
        await setRed(eth1.dns, result.dns)
    }
    return wrong
}

async function setRed(element, state) {
    if (state == false) {
        element.style["background"] = "red";
        element.style["border"] = "var(--bs-border-width) solid black";
    }
    else {
        element.style["background"] = "";
        element.style["border"] = "";
    }
}

check_button.addEventListener('click', async function () {
    let wrong = 0;
    wrong = await check_ips();
    if (wrong > 0) {
        alert("Проверьте правильность данных в выделенных полях!")
    }
})

save_button.addEventListener("click", async function () {
    let wrong = 0;
    wrong = await check_ips();
    if (wrong > 0) {
        alert("Проверьте правильность данных в выделенных полях!")
    }
    else if (wrong == 0) {
        let ip_data = {}
        if (dhcp_flag_eth0 == true) {
            let eth0_data = {
                eth0: {
                    ip: eth0.ip.value,
                    router: eth0.router.value,
                    dns: eth0.dns.value,
                }
            }
            ip_data = { ...ip_data, ...eth0_data }
        }
        if (dhcp_flag_eth1 == true) {
            let eth1_data = {
                eth1: {
                    ip: eth1.ip.value,
                    router: eth1.router.value,
                    dns: eth1.dns.value,
                }
            }
            ip_data = { ...ip_data, ...eth1_data }
        }
        ip_data = { ...ip_data, ...{ session_token: localStorage.getItem("real_lab_conf") } }
        console.log(ip_data)
    }
})

async function start() {
    let dhcp_data = await normal_fetch("POST", "/settings/host/get_dhcp", {
        'Content-Type': 'application/json'
    }, {
        session_token: localStorage.getItem("real_lab_conf")
    });

    if (dhcp_data.eth0) {
        eth0_switch.checked = true;
        dhcp_flag_eth0 = true;

        eth0.ip.value = dhcp_data.eth0.ip_address;
        eth0.router.value = dhcp_data.eth0.routers;
        eth0.dns.value = dhcp_data.eth0.dns_servers;

        eth0.ip.disabled = false;
        eth0.router.disabled = false;
        eth0.dns.disabled = false;
    }

    if (dhcp_data.eth1) {
        eth1_switch.checked = true;
        dhcp_flag_eth1 = true;

        eth1.ip.value = dhcp_data.eth1.ip_address;
        eth1.router.value = dhcp_data.eth1.routers;
        eth1.dns.value = dhcp_data.eth1.dns_servers;

        eth1.ip.disabled = false;
        eth1.router.disabled = false;
        eth1.dns.disabled = false;
    }
}

start();



