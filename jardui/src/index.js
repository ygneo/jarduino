import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'



function renderDeviceStatus(status, deviceName) {
    let statusMessage = {
        "success": "Dispositivo Arduino detectado (" + deviceName + ")",
        "error": "No se ha detectado ningún dispositivo Arduino",
    }
    let msg = statusMessage[status]

    const element = (
        <div className={status}>
            <span id="icon"></span>
            <span id="msg">{msg}</span>
        </div>
    )

    ReactDOM.render(
        element,
        document.getElementById('status')
    )
}



class ArduinoDevice {
    detect() {
        let pyshell = new pythonShell('jarduino.py', {"args": ["detect"]});

        pyshell.on('message', function (deviceName) {
            renderDeviceStatus("success", deviceName)
        })

        pyshell.on('error', function (message) {
            renderDeviceStatus("error")
        })

        pyshell.end(function (err) {
            if (err) {
                console.log(err)
            }
            console.log('finished')
        })
    }

}


let device = new ArduinoDevice

setInterval(device.detect, 1500);

require('nw.gui').Window.get().maximize()

