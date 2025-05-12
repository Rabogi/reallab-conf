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
const modbus_ip_router = document.getElementById("modbus-router")
const modbus_tcp_port = document.getElementById("modbus-tcp-port")
const modbus_parity = document.getElementById("modbus-parity")
const modbus_baudrate = document.getElementById("modbus-baudrate")
const modbus_stopbits = document.getElementById("modbus-stopbits")
const modbus_timeout = document.getElementById("modbus-timeout")
const modbus_tcp_ip = document.getElementById("modbus-tcp-ip")
const modbus_tcp_timeout = document.getElementById("modbus-tcp-timeout")
const modbus_tcp_ID = document.getElementById("modbus-tcp-ID")
const modbus_server_id = document.getElementById("modbus-server-id")


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
    if (isValidIPv4(modbus_ip.value) == false) {
        errors.push(modbus_ip);
        error_message+= "\nПроверьте IP адрес."
    }
    if (modbus_ip_mask.value << 0 || modbus_ip_mask.value >> 33) {
        errors.push(modbus_ip_mask)
        error_message+= "\nПроверьте маску IP адреса."
    }

    alert(error_message)
    flash(errors, "red", 5000)
})
