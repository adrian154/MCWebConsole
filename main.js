//fetch("http://localhost:20560/players", {credentials: "include"});
const urlBase = "https://siphon.bithole.dev",
      eventsEndpoint = new URL("/events", urlBase).href,
      commandEndpoint = new URL("/command", urlBase).href;

const server = new EventSource(eventsEndpoint, {withCredentials: true});
const input = document.getElementById("input"),
      consoleArea = document.getElementById("console");

const timeFormat = new Intl.DateTimeFormat([], {timeStyle: "short"});

const connectStatus = document.getElementById("connection-status");
server.addEventListener("error", event => {
    connectStatus.textContent = "not connected :("
    connectStatus.style.color = "#ff0000";
});

server.addEventListener("open", event => {
    connectStatus.textContent = "connected :)"
    connectStatus.style.color = "#00ff00";
});

server.addEventListener("message", message => {
    
    const event = JSON.parse(message.data);
    console.log(event);
    
    if(event.event === "log") {

        // make new console line
        const line = document.createElement("p");
    
        const level = document.createElement("span");
        level.textContent = `[${event.level}]`;
        switch(event.level) {
            case "FATAL":
            case "ERROR":
                level.classList("fc");
                break;
            case "WARN":
                level.classList.add("f6");
                break;
            case "INFO":
                level.classList.add("ff");
                break;
            default:
                level.classList.add("f7");
        }

        line.append(
            `[${timeFormat.format(new Date(event.timestamp))}]`,
            " ",
            level,
            " ",
            event.message
        );

        consoleArea.append(line);
        line.scrollIntoView();

    }

});

document.getElementById("clear").addEventListener("click", () => consoleArea.replaceChildren());

document.getElementById("form").addEventListener("submit", event => {
    event.preventDefault();
    fetch(commandEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(input.value)
    }).then(async resp => {
        if(!resp.ok) {
            try {
                alert((await resp.json()).error);
            } catch(err) {
                alert("Things have gone really wrong.");
            }
        }
    }).catch(err => alert(err.message));
    input.value = "";
});