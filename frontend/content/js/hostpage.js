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
    if(dhcp_flag_eth0 == true) {
        let eth0_data = {
            ip: eth0.ip.value,
            router: eth0.router.value,
            dns: eth0.dns.value,
        }
        let result = await normal_fetch("POST","/utils/check_ips",{'Content-Type': 'application/json'},{
            ...eth0_data , ...{session_token: localStorage.getItem("real_lab_conf")}
        });
        console.log(result);
        setRed(eth0.ip,result.ip)
        setRed(eth0.router,result.router)
        setRed(eth0.dns,result.dns)
    }
}

async function setRed(element,state){
    if(state == false) {
        element.style["background"] = "red";
    }
    else {
        element.style["background"] = "";
    }
}

check_button.addEventListener('click', async function () {
    await check_ips();
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



