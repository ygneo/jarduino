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


function renderDeviceStatus(status, deviceName, element) {
    let statusMessage = {
        "success": "Dispositivo Arduino detectado (" + deviceName + ")",
        "error": "No se ha detectado ningún dispositivo Arduino",
    }
    let msg = statusMessage[status]

    ReactDOM.render(
        <DeviceStatus status={status} msg={msg}/>,
        element
    )
}



class ArduinoDevice {
    detect(element) {
        let pyshell = new pythonShell('jarduino.py', {"args": ["detect"]});

        pyshell.on('message', function (deviceName) {
            renderDeviceStatus("success", deviceName, element)
        })

        pyshell.on('error', function (message) {
            renderDeviceStatus("error", "", element)
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
