const tcprtu_elements = document.querySelectorAll('.common');
const rtutcp_elements = document.querySelectorAll('.rtu-tcp');
const universal_elements = document.querySelectorAll('.universal');

const mode_switch = document.getElementById("modbus-work-mode")
const modbus_button_reload = document.getElementById("modbus-reload")
const modbus_button_submit = document.getElementById("modbus-submit")
const modbus_version = document.getElementById("modbus-version")
const modbus_mac = document.getElementById("modbus_mac")
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
const allowed_baudrates = [1200,2400,4800,9600,19200,38400,57600,115200,128000,256000]

let mode = 1

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
        if (el.value !== 502 && (el.value < 10000 || el.value > 65535)) {
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

    if (errors.length > 0) {
        alert(error_message)
        flash(errors, "red", 1000)
    }
})
