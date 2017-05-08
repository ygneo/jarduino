import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'
import ArduinoDevice from './jardui/lib/devices.js'


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

window.require('nw.gui').Window.get().maximize()

renderCreateIrrigationZoneCard()

document.addEventListener("DOMContentLoaded", function(event) {
    // temp solution? webpack binding? react renadering?
    setInterval(function(){
        device.detect(document.getElementById('status'))
    }, 2000)
});
