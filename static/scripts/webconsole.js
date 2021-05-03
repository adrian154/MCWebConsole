let url = new URL(window.location.href);
let themeStr = url.searchParams.get("theme");

if(themeStr) {
    let file = document.createElement("link");
    file.setAttribute("rel", "stylesheet");
    file.setAttribute("type", "text/css");
    file.setAttribute("href", `/themes/${themeStr}.css`);
    document.head.appendChild(file);
}


let pw = prompt("Enter your password: ");

const ws = new WebSocket((window.location.protocol == "http:" ? "ws://" : "wss://") + window.location.host + ":8080");

const commandArea = document.getElementById("command-input");
const consoleArea = document.getElementById("console-area");

const formatMC = (text) => {

    let spans = 0;

    text = text.replace(/\n/g, "<br>");
    text = text.replace(/§(.)/g, (match, group) => {
        spans++;
        return `<span class="f${group}">`;
    });
    
    text += "</span>".repeat(spans);
    
    return text;

};

commandArea.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        ws.send(JSON.stringify({
            type: "cmd",
            cmd: commandArea.value
        }));
        commandArea.value = "";
    }
});

ws.addEventListener("open", () => {
    ws.send(JSON.stringify({
        type: "auth",
        password: pw
    }));
});

ws.addEventListener("message", (message) => {

    let log = JSON.parse(message.data);

    if(log.type === "console") {

        let newLine = document.createElement("p");
    
        let date = new Date(log.timestamp)
        let dateFmt = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        let text = `[${dateFmt}] [${log.threadName}] [${log.level}] ${formatMC(log.message)}`;

        newLine.innerHTML = text;
        consoleArea.appendChild(newLine);
    
    }

});

let spam = function() {
    for(let i = 0; i < 100; i++) {
        let el = document.createElement("p");
        el.appendChild(document.createTextNode("hey"));
        consoleArea.appendChild(el);
    }
};