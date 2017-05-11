import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'
import ArduinoDevice from './jardui/lib/devices.js'
import IrrigationZone from './jardui/lib/zones.js'
import Zones from './jardui/lib/zones.js'


window.require('nw.gui').Window.get().maximize()


ReactDOM.render(
    <Zones />,
    document.getElementById('main')
)


document.addEventListener("DOMContentLoaded", function(event) {
        let device = new ArduinoDevice

        // temp solution? webpack binding? react rendering and pass only root?
        setInterval(function(){
        device.detect(document.getElementById('status'))
    }, 2000)
});
