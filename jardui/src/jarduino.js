var fs = require('fs');
var childProcess =  require("child_process");
var pythonShell = require('python-shell');
var running_pyshell = null;
var seriesData = [[],[]];


function soilMoistureValues() {
    return "{" + document.getElementById("watering1_moisture").value + "," + document.getElementById("watering2_moisture").value + "}";
}


function jarduinoUpload() {
    var pyshell = new pythonShell('jarduino.py', {"args": ["upload"]});

    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            console.log(err);
        };
        console.log('finished');
        runnig_pyshell = createJarduinoPyShell();
    });
}

function update() {
    var codeConfig = {
        "soilMoistureMinSensorValues": soilMoistureValues(),
        "checkingDelay": 1000,
        "numchecksBeforeWatering": 3,
        "wateringTime": [200, 300]
    }
    var json = JSON.stringify(codeConfig);
    fs.writeFile('sketches/jarduino/jarduino.json', json, 'utf8');

    running_pyshell.childProcess.kill();

    setTimeout(jarduinoUpload, 3000);

}

function createJarduinoReadInputPyShell(fake_input) {
    if (fake_input == undefined) {
        fake_input = false;
    }
    var args = ["read"];

    if (fake_input) {
        args = ["readfake"];
    }

    var pyshell = new pythonShell('jarduino.py', {"args": args, "mode": "json"});

    pyshell.on('message', function (message) {
        var timestamp = new Date().getTime();
        var id = message[0];

        console.log(message);

        value = parseInt(message[1]);

        if (value) {
            seriesData[id].push({ x: timestamp, y: parseInt(message[1])});
        }
        graph.update();
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            console.log(err);
        };
        console.log('finished');
    });

    return pyshell;
}

function readSerialInput(fakeSerialInput) {
    console.log(fakeSerialInput);
    if (fakeSerialInput == "on") {
        fakeSerialInput = true;
    } else {
        fakeSerialInput = false;
    }
    running_pyshell = createJarduinoReadInputPyShell(fakeSerialInput);
}


function createIrrigationZone(div) {
    div.destroy();
}

require('nw.gui').Window.get().maximize();
readSerialInput();

