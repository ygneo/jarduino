import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'


const e = React.createElement


class ArduinoDevice {
    detect() {
        let pyshell = new pythonShell('jarduino.py', {"args": ["detect"]});

        pyshell.on('message', function (message) {
            ReactDOM.render(
                e('h1', null, message),
                document.getElementById('root')
            );
        });

        pyshell.on('error', function (message) {
            ReactDOM.render(
                e('h1', null, 'No HAY'),
                document.getElementById('root')
            );
        });

        pyshell.end(function (err) {
            if (err) {
                console.log(err)
            }
            console.log('finished')
        });
    }

}


let device = new ArduinoDevice

setInterval(device.detect, 1500);

require('nw.gui').Window.get().maximize()

