import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'
import DeviceStatus from './jardui/lib/device_status.js'
import Zones from './jardui/lib/zones.js'
import DeviceSearcher from './jardui/lib/device_searcher.js'
import ZonesStorage from './jardui/lib/storage.js'


window.require('nw.gui').Window.get().maximize()


class App extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            "status": "searching",
            "device_found": false
        }

        this.storage = new ZonesStorage
        this.device_searcher = new DeviceSearcher

        this.handleZonesUpdated = this.handleZonesUpdated.bind(this)
        this.handleDeviceFound = this.handleDeviceFound.bind(this)
        this.handleDeviceNotFound = this.handleDeviceNotFound.bind(this)
        this.handleCodeUploaded = this.handleCodeUploaded.bind(this)
        this.handleCodeUploadError = this.handleCodeUploadError.bind(this)
        this.handleCodeUpload = this.handleCodeUpload.bind(this)
        this.uploadCodeToDevice = this.uploadCodeToDevice.bind(this)
    }

    handleZonesUpdated() {
        this.setState({
            "status": "changes_ready"
        })
    }

    handleDeviceFound(device) {
        this.setState({
            "status": "success",
            "device_found": true,
            "device": device
        })
    }

    handleDeviceNotFound() {
        this.setState({
            "status": "detection_error",
            "device_found": false
        })
    }

    handleCodeUploaded() {
        this.setState({
            status: "changes_uploaded"
        })
    }

    handleCodeUploadError() {
        this.setState({
            status: "changes_upload_error"
        })
    }

    handleCodeUpload() {
        this.state.device.upload(
            this.storage.getZones(),
            {
                onUploaded: this.handleCodeUploaded,
                onUploadError: this.handleCodeUploadError
            }
        )
    }

    uploadCodeToDevice() {
        this.setState({
            status: "uploading"
        })
    }

    render() {
        let uploadButtonClassName = "disabled"

        if (this.state.device_found === true) {
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
                                              onReadyForUpload={this.handleCodeUpload}
                                />
                            </div>
                            <div id="buttons">
                                <button
                                    type="button"
                                    className={uploadButtonClassName}
                                    onClick={this.uploadCodeToDevice}
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
