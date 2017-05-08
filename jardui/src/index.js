import React from 'react'
import ReactDOM from 'react-dom'
import ArduinoDevice from './jardui/lib/devices.js'


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


function IrrigationZoneButton(props) {
    return (
        <div className="create_irrigation_zone" onClick={renderIrrigationZoneForm}>
            <span id="icon"></span>
            <p>CREAR ZONA DE RIEGO</p>
        </div>
    )
}


function renderIrrigationZoneForm() {
    
}

function renderCreateIrrigationZoneCard(){
    ReactDOM.render(
        <IrrigationZoneButton/>,
        document.getElementById('create_irrigation_zone_card')
    )
}

let device = new ArduinoDevice

require('nw.gui').Window.get().maximize()

renderCreateIrrigationZoneCard()

// maybe stop after n retries and restart on user interaction?
setInterval(device.detect, 1500);


