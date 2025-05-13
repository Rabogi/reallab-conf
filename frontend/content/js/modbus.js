const tcprtu_elements = document.querySelectorAll('.common');
const rtutcp_elements = document.querySelectorAll('.rtu-tcp');
const universal_elements = document.querySelectorAll('.universal');

const mode_switch = document.getElementById("modbus-work-mode")
const modbus_device = document.getElementById("modbus-device")
const modbus_button_scan = document.getElementById("modbus-scan")
const modbus_button_reload = document.getElementById("modbus-reload")
const modbus_button_submit = document.getElementById("modbus-submit")
const modbus_version = document.getElementById("modbus-version")
const modbus_mac = document.getElementById("modbus-mac")
const modbus_ip = document.getElementById("modbus-ip")
const modbus_ip_mask = document.getElementById("modbus-ip-mask")
const modbus_ip_router = document.getElementById("modbus-ip-router")
const modbus_tcp_port = document.getElementById("modbus-tcp-port")
const modbus_parity = document.getElementById("modbus-parity")
const modbus_baudrate = document.getElementById("modbus-baudrate")
const modbus_stopbits = document.getElementById("modbus-stopbits")
const modbus_timeout = document.getElementById("modbus-timeout")
const modbus_tcp_ip = document.getElementById("modbus-tcp-ip")
const modbus_tcp_timeout = document.getElementById("modbus-tcp-timeout")
const modbus_tcp_ID = document.getElementById("modbus-tcp-ID")
const modbus_server_id = document.getElementById("modbus-server-id")
const modbus_mode = document.getElementById("modbus-mode")
const allowed_baudrates = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 128000, 256000]

let mode = 1

async function normal_fetch(method, url, headers, body) {
    let response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
    let data = await response.json(); // Add await here
    return data;
}

async function flash(elements, color, time) {
    // Store original background colors
    const originalColors = [];

    // Set elements to green with smooth transition
    elements.forEach((el, i) => {
        originalColors[i] = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
        el.style.transition = 'background-color 0.5s ease';
        el.style.backgroundColor = color;
    });

    // After 5 seconds, transition back to original colors
    setTimeout(() => {
        elements.forEach((el, i) => {
            el.style.backgroundColor = "white";

            // Remove transition after it's done to avoid affecting other style changes
            setTimeout(() => {
                el.style.transition = '';
            }, 500);
        });
    }, time);
}

document.addEventListener("DOMContentLoaded", async () => {
    let devices = await normal_fetch("GET", "/modbus/get_ports", { 'Content-Type': 'application/json' })
    modbus_device.innerHTML = '<option disabled selected value style="display: none;"></option>'
    devices.forEach((device) => {
        modbus_device.innerHTML += '<option>' + device + '</option>'
    })
})

mode_switch.addEventListener("change", () => {
    if (mode_switch.value == 1) {
        mode = 1;
        rtutcp_elements.forEach(element => {
            element.classList.add("hidden");
        });;
        universal_elements.forEach(element => {
            element.classList.add("hidden");
        });;
    }
    else if (mode_switch.value == 2) {
        mode = 2;
        universal_elements.forEach(element => {
            element.classList.add("hidden");
        });;
        rtutcp_elements.forEach(element => {
            element.classList.remove("hidden");
        });;
    }
    else if (mode_switch.value == 3) {
        mode = 3;
        rtutcp_elements.forEach(element => {
            element.classList.add("hidden");
        });;
        universal_elements.forEach(element => {
            element.classList.remove("hidden");
        });;
    }
})

function isValidIPv4(ip) {
    const segments = ip.split('.');
    if (segments.length !== 4) return false;

    return segments.every(segment => {
        const num = parseInt(segment, 10);
        return num >= 0 && num <= 255 && String(num) === segment;
    });
}

modbus_button_submit.addEventListener("click", () => {
    // Проверка IP,Маски, роутера, TCP порта, Паритета, баудрейта и стоп бита происходит всегда
    let errors = [];
    let error_message = "Ошибка, в полях ввода недопустимые данные.";

    let el = modbus_ip
    if (el.value.trim().length !== 0) {
        if (isValidIPv4(el.value) == false) {
            errors.push(el);
            error_message += "\nПроверьте IP адрес."
        }
    }
    else {
        errors.push(el);
        error_message += "\nВведите IP адрес."
    }

    el = modbus_ip_mask
    if (el.value.trim().length !== 0) {
        if (el.value < 0 || el.value > 33) {
            errors.push(el)
            error_message += "\nМаска IP адреса должна быть в интервале [0-32]."
        }
    }
    else {
        errors.push(el)
        error_message += "\nВведите маску IP адреса."
    }

    el = modbus_ip_router
    if (el.value.trim().length !== 0) {
        if (isValidIPv4(el.value) == false) {
            errors.push(el);
            error_message += "\nПроверьте IP адрес шлюза."
        }
    }
    else {
        errors.push(el);
        error_message += "\nВведите IP адрес шлюза."
    }

    el = modbus_tcp_port
    if (el.value.trim().length !== 0) {
        if (el.value != 502 && (el.value < 10000 || el.value > 65535)) {
            errors.push(el);
            error_message += "\nПроверьте TCP порт."
        }
    }
    else {
        errors.push(el);
        error_message += "\nВведите TCP порт."
    }

    el = modbus_parity
    if (el.value.trim().length !== 0) {
        if (el.value < 1 || el.value > 3) {
            errors.push(el);
            error_message += "\nПроверьте настройку паритета."
        }
    }
    else {
        errors.push(el);
        error_message += "\nВыберете режим паритета."
    }

    el = modbus_baudrate
    if (el.value.trim().length !== 0) {
        if (allowed_baudrates.includes(Number(el.value)) == false) {
            errors.push(el);
            error_message += "\nПроверьте скорость RS-485."
        }
    }
    else {
        errors.push(el);
        error_message += "\nВыберете скорость RS-485."
    }

    el = modbus_stopbits
    if (el.value.trim().length !== 0) {
        if (el.value < 1 || el.value > 2) {
            errors.push(el);
            error_message += "\nПроверьте настройку количества стоп бит."
        }
    }
    else {
        errors.push(el);
        error_message += "\nВыберете количество стоп бит."
    }

    if (mode == 2 || mode == 3) {
        el = modbus_tcp_ip
        if (el.value.trim().length !== 0) {
            if (isValidIPv4(el.value) == false) {
                errors.push(el);
                error_message += "\nПроверьте IP адрес TCP сервера."
            }
        }
        else {
            errors.push(el);
            error_message += "\nВведите IP адрес TCP сервера."
        }

        el = modbus_tcp_timeout
        if (el.value.trim().length !== 0) {
            if (el.value < 5 || el.value > 240) {
                errors.push(el);
                error_message += "\nТаймаут для TCP сервера должен быть в интервале [5-240] сек."
            }
        }
        else {
            errors.push(el);
            error_message += "\nВведите таймаут для TCP сервера."
        }
    }

    if (mode == 3) {
        el = modbus_mode
        if (el.value.trim().length !== 0) {
            if (el.value < 1 || el.value > 2) {
                errors.push(el);
                error_message += "\nПроверьте режим работы."
            }
        }
        else {
            errors.push(el);
            error_message += "\nВведите режим работы."
        }

        el = modbus_timeout
        if (el.value.trim().length !== 0) {
            if (el.value < 100 || el.value > 60000) {
                errors.push(el);
                error_message += "\nТаймаут должен быть в интервале [100-60000] мс."
            }
        }
        else {
            errors.push(el);
            error_message += "\nВведите таймаут."
        }


        el = modbus_tcp_ID
        if (el.value.trim().length !== 0) {
            if (el.value < 1 || el.value > 247) {
                errors.push(el);
                error_message += "\nID в сети RTU должен быть в интервале [1-247]."
            }
        }
        else {
            errors.push(el);
            error_message += "\nВведите ID в сети RTU."
        }

        el = modbus_server_id
        if (el.value.trim().length !== 0) {
            if (el.value < 1 || el.value > 255 || (isNaN(el.value) && el.value !== "off")) {
                errors.push(el);
                error_message += "\nID сервера должен быть в интервале [1-255] или off."
            }
        }
        else {
            errors.push(el);
            error_message += "\nВведите ID сервера."
        }
    }


    if (errors.length > 0) {
        alert(error_message)
        flash(errors, "red", 1000)
    }
})

async function send_command(command, device) {
    return await normal_fetch("POST", "/modbus/send_command", { 'Content-Type': 'application/json' }, {
        "session_token": localStorage.getItem("real_lab_conf"),
        "port": device,
        "baudrate": 9600,
        "cmd": command,
    })
}



async function set_field(element, value, flash_color, flash_time) {
    if (value != null) {
        element.value = value
    }
    flash([element], flash_color, flash_time)
}

async function fetch_and_set(field, command, device) {
    let data = await send_command(command, device)
    if (data.response_string !== '') {
        console.log(data)
        data = data.response_string.split(":")[1]
        if (data.length > 0 && data !== undefined) {
            set_field(field, data, 'rgb(27, 207, 123)', 1000)
            return true
        }
        set_field(field, null, "red", 1000)
        return false
    }
    else {
        set_field(field, null, "red", 1000)
        return false
    }
}


modbus_button_scan.addEventListener("click", async function () {
    let selected_device = modbus_device.value
    if (selected_device != "") {
        if (mode == "3") {
            fetch_and_set(modbus_mode, "mode tcp", selected_device)
            fetch_and_set(modbus_version, "version", selected_device)
        }
        fetch_and_set(modbus_mac, "mac", selected_device)
        fetch_and_set(modbus_ip, "ip", selected_device)
        fetch_and_set(modbus_ip_mask, "mask", selected_device)
        fetch_and_set(modbus_ip_router, "gateway", selected_device)
        fetch_and_set(modbus_tcp_port, "port tcp", selected_device)
        fetch_and_set(modbus_parity, "parity", selected_device)
        fetch_and_set(modbus_baudrate, "speed rs485", selected_device)
        fetch_and_set(modbus_stopbits, "stop bit", selected_device)
        if (mode == "2") {
            fetch_and_set(modbus_tcp_ip, "ip server tcp", selected_device)
            fetch_and_set(modbus_tcp_timeout, "timeout tcp", selected_device)
        }
        if (mode == "3") {
            fetch_and_set(modbus_timeout, "timeout response", selected_device)
            fetch_and_set(modbus_tcp_ip, "ip server tcp", selected_device)
            fetch_and_set(modbus_tcp_timeout, "timeout tcp", selected_device)
            fetch_and_set(modbus_tcp_ID, "rtu virtual id", selected_device)
            fetch_and_set(modbus_server_id, "tcp slave id", selected_device)
        }
    }
    else {
        alert("Необходимо выбрать устройство!")
    }
})