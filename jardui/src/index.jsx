import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'
import DeviceStatus from './jardui/lib/devices.js'
import Zones from './jardui/lib/zones.js'


window.require('nw.gui').Window.get().maximize()


class App extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            "status": "searching"
        }

        this.handleZonesUpdated = this.handleZonesUpdated.bind(this)
        this.handleDeviceFound = this.handleDeviceFound.bind(this)
        this.handleDeviceNotFound = this.handleDeviceNotFound.bind(this)

        this.deviceReady = this.deviceReady.bind(this)

    }

    handleZonesUpdated() {
        this.setState({
            "status": "changes_ready"
        })
    }

    handleDeviceFound() {
        this.setState({
            "status": "success"
        })
    }

    handleDeviceNotFound() {
        this.setState({
            "status": "detection_error"
        })
    }

    deviceReady() {
        return (this.state.status === "success" ||
                this.state.status === "changes_ready")
    }

    render() {
        let uploadButtonClassName = "disabled"

        if (this.deviceReady() === true) {
            uploadButtonClassName = "enabled"
        }

        return (
            <div id="app">
                <head>
                    <title>Jarduino</title>
                </head>

                <body>
                    <header>
                        <h1>Jarduino</h1>
                        <div id="jarduino_controls">
                            <div id="status">
                                <DeviceStatus status={this.state.status}
                                              onDeviceFound={this.handleDeviceFound}
                                              onDeviceNotFound={this.handleDeviceNotFound}
                                />
                            </div>
                            <div id="buttons">
                                <button
                                    type="button"
                                    className={uploadButtonClassName}
                                >REPROGRAMAR</button>
                            </div>
                        </div>
                    </header>

                    <div id="main">
                        <Zones onZonesUpdated={this.handleZonesUpdated}/>
                    </div>
                </body>
            </div>
        )
    }
}


ReactDOM.render(
    <App />,
    document.getElementById('root')
)
