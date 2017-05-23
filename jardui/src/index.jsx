import React from 'react'
import ReactDOM from 'react-dom'
import DeviceStatus from './jardui/lib/device_status.js'
import Zones from './jardui/lib/zones.js'
import ZonesStorage from './jardui/lib/storage.js'
import UploadCodeToDeviceButton from './jardui/lib/widgets/buttons/upload_code.js'


window.require('nw.gui').Window.get().maximize()


class App extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            "status": "searching",
            "deviceFound": false
        }

        this.storage = new ZonesStorage

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
            "deviceFound": true,
            "device": device
        })
    }

    handleDeviceNotFound() {
        this.setState({
            "status": "detection_error",
            "deviceFound": false
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
                                <UploadCodeToDeviceButton
                                    enabled={this.state.deviceFound}
                                    onClick={this.uploadCodeToDevice}
                                />
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
