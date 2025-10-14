document.onkeydown = updateKey;
document.onkeyup = resetKey;

const net = require('net');

const server_port = 65432;
const server_addr = "192.168.1.55";
let client = null;

function connectToServer() {
    client = net.createConnection({ port: server_port, host: server_addr }, () => {
        console.log('Connected to Raspberry Pi server!');
        document.getElementById("reply").innerHTML = "Connected to Pi";
    });

    client.on('data', (data) => {
        const msg = data.toString().trim();
        console.log('From Pi: ', msg);

        const tempMatch = msg.match(/TEMP:([\d.]+)C/);
        const ultrasonicMatch = msg.match(/ULTRASONIC:([\d.]+)cm/);
        const distMatch = msg.match(/DISTANCE:([\d.]+)ft/);

        console.log('TEMP', tempMatch);
        console.log('ULTRASONIC', ultrasonicMatch);
        console.log('DISTANCE', distMatch);

        if (tempMatch) {
            const temp = parseFloat(tempMatch[1]);
            document.getElementById("temperature").innerText = temp.toFixed(2);
        }

        if (ultrasonicMatch) {
            // FIX: Use ultrasonicMatch instead of distMatch!
            const dist = parseFloat(ultrasonicMatch[1]);
            document.getElementById("ultrasonic").innerText = dist.toFixed(2);
        }

        if (distMatch) {
            const dist = parseFloat(distMatch[1]);
            document.getElementById("distance").innerText = dist.toFixed(2);
        }

        // Handle command acknowledgements
        if (msg.startsWith("OK:")) {
            const direction = msg.split(":")[1];
            document.getElementById("direction").innerText = direction;
        }
    });

    client.on('end', () => {
        console.log('Disconnected from server');
        document.getElementById("reply").innerHTML = "Disconnected";
        client = null;
    });

    client.on('error', (err) => {
        console.error('Connection error:', err.message);
        document.getElementById("reply").innerHTML = "Error: " + err.message;
        client = null;
    });
}

function to_server(message) {
    if (client && !client.destroyed) {
        client.write(`${message}\r\n`);
        console.log("Sent:", message);
    } else {
        console.warn("Not connected... reconnecting...");
        connectToServer();
        setTimeout(() => {
            if (client && !client.destroyed) {
                client.write(`${message}\r\n`);
            }
        }, 500);
    }
}

function updateKey(e) {
    e = e || window.event;
    const key = e.keyCode;

    if (key === 87) {
        document.getElementById("upArrow").style.color = "green";
        to_server("up");
    } else if (key === 83) {
        document.getElementById("downArrow").style.color = "green";
        to_server("down");
    } else if (key === 65) {
        document.getElementById("leftArrow").style.color = "green";
        to_server("left");
    } else if (key === 68) {
        document.getElementById("rightArrow").style.color = "green";
        to_server("right");
    }
}

function resetKey(e) {
    document.getElementById("upArrow").style.color = "grey";
    document.getElementById("downArrow").style.color = "grey";
    document.getElementById("leftArrow").style.color = "grey";
    document.getElementById("rightArrow").style.color = "grey";
}

// update data for every 50ms
function update_data(){
    setInterval(function(){
        // get image from python server
        to_server("update");
    }, 1000);
}

// Connect to the Pi on startup
connectToServer();
update_data();