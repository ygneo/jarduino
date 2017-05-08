import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'


function DeviceStatus(props) {
    return  (
        <div className={props.status}>
            <span id="icon"></span>
            <span id="msg">{props.msg}</span>
        </div>
    )
}


function renderDeviceStatus(status, deviceName) {
    let statusMessage = {
        "success": "Dispositivo Arduino detectado (" + deviceName + ")",
        "error": "No se ha detectado ningún dispositivo Arduino",
    }
    let msg = statusMessage[status]

    ReactDOM.render(
        <DeviceStatus status={status} msg={msg}/>,
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


export default ArduinoDevice
