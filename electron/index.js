document.onkeydown = updateKey;
document.onkeyup = resetKey;

const net = require('net');

const server_port = 65432;
const server_addr = "192.168.1.55";   // IP address of your Raspberry Pi
let client = null;                    // persistent client connection

// Connect to server once
function connectToServer() {
    client = net.createConnection({ port: server_port, host: server_addr }, () => {
        console.log('Connected to Raspberry Pi server!');
        document.getElementById("bluetooth").innerHTML = "Connected to Pi";
    });

    client.on('data', (data) => {
        const msg = data.toString().trim();
        console.log('From Pi:', msg);
        document.getElementById("bluetooth").innerHTML = msg;
    });

    client.on('end', () => {
        console.log('Disconnected from server');
        document.getElementById("bluetooth").innerHTML = "Disconnected";
        client = null;
    });

    client.on('error', (err) => {
        console.error('Connection error:', err.message);
        document.getElementById("bluetooth").innerHTML = "Error: " + err.message;
        client = null;
    });
}

// General-purpose function to send data to the server
function to_server(message) {
    if (client && !client.destroyed) {
        client.write(`${message}\r\n`);
        console.log("Sent:", message);
    } else {
        console.warn("Not connected...reconnecting...");
        connectToServer();
        // small delay to ensure connection is re-established
        setTimeout(() => {
            if (client && !client.destroyed) {
                client.write(`${message}\r\n`);
            }
        }, 500);
    }
}

// Handle key press for WASD movement
function updateKey(e) {
    e = e || window.event;

    if (e.keyCode == '87') {
        document.getElementById("upArrow").style.color = "green";
        to_server("up");
    }
    else if (e.keyCode == '83') {
        document.getElementById("downArrow").style.color = "green";
        to_server("down");
    }
    else if (e.keyCode == '65') {
        document.getElementById("leftArrow").style.color = "green";
        to_server("left");
    }
    else if (e.keyCode == '68') {
        document.getElementById("rightArrow").style.color = "green";
        to_server("right");
    }
}

// Reset the key color to default when released
function resetKey(e) {
    e = e || window.event;
    document.getElementById("upArrow").style.color = "grey";
    document.getElementById("downArrow").style.color = "grey";
    document.getElementById("leftArrow").style.color = "grey";
    document.getElementById("rightArrow").style.color = "grey";
}

// Send periodic updates every 50 ms (optional)
function update_data() {
    setInterval(function () {
        if (client && !client.destroyed) {
            client.write("ping\r\n");
        }
    }, 50);
}

// Connect when the app loads
connectToServer();
