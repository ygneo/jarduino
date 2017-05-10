import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'
import ArduinoDevice from './jardui/lib/devices.js'
import IrrigationZone from './jardui/lib/zones.js'


function renderZones() {
    ReactDOM.render(
        <IrrigationZone/>,
        document.getElementById('main')
    )
}

window.require('nw.gui').Window.get().maximize()

renderZones()

document.addEventListener("DOMContentLoaded", function(event) {
    let device = new ArduinoDevice

    // temp solution? webpack binding? react renadering?
    setInterval(function(){
        device.detect(document.getElementById('status'))
    }, 2000)
});
