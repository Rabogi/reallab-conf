const tcprtu_elements = document.querySelectorAll('.common');
const rtutcp_elements = document.querySelectorAll('.rtu-tcp');
const universal_elements = document.querySelectorAll('.universal');

const mode_switch = document.getElementById("modbus-work-mode")

let mode = 1

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