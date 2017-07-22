import React from 'react'
import ReactDOM from 'react-dom'
import DeviceStatus from './jardui/lib/device_status.js'
import Zones from './jardui/lib/zones.js'
import ZonesStorage from './jardui/lib/storage.js'
import UploadCodeToDeviceButton from './jardui/lib/widgets/buttons/upload_code.js'
import SettingsButton from './jardui/lib/widgets/buttons/settings.js'
import SettingsModal from './jardui/lib/widgets/modals/settings.js'
import HistoricModal from './jardui/lib/widgets/modals/historic.js'
import DeviceReader from './jardui/lib/devices/reader.js'
import parseData from './jardui/lib/parser.js'


window.require('nw.gui').Window.get().maximize()


class App extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            "status": "searching",
            "deviceFound": false,
            "zonesData": null,
            showSettingsModal: false
        }

        this.storage = new ZonesStorage

        this.handleZonesUpdated = this.handleZonesUpdated.bind(this)
        this.handleDeviceFound = this.handleDeviceFound.bind(this)
        this.handleDeviceNotFound = this.handleDeviceNotFound.bind(this)
        this.handleCodeUploaded = this.handleCodeUploaded.bind(this)
        this.handleCodeUploadError = this.handleCodeUploadError.bind(this)
        this.handleCodeUpload = this.handleCodeUpload.bind(this)
        this.handleOpenSettingsModal = this.handleOpenSettingsModal.bind(this)
        this.handleCloseSettingsModal = this.handleCloseSettingsModal.bind(this)

        this.uploadCodeToDevice = this.uploadCodeToDevice.bind(this)
        this.isUploadButtonEnabled = this.isUploadButtonEnabled.bind(this)
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

        this.handleReadFromDevice()
    }

    handleReadFromDevice() {
        let this_instance = this

        this.deviceReader = new DeviceReader(this.state.device)

        this.deviceReader.startReading({
            "onMessage": function (message) {
                let data = parseData(message)

                this_instance.setState(
                    {zonesData: data}
                )

                this_instance.storage.addZonesData(data)
            },
            "onError": function (error) {
                console.log(error)
            }
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

        this.handleReadFromDevice()
    }

    handleCodeUploadError() {
        this.setState({
            status: "changes_upload_error"
        })
    }

    handleCodeUpload() {
        if (this.deviceReader) {
            this.deviceReader.stopReading()
        }

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


    isUploadButtonEnabled() {
        return (this.state.deviceFound && this.state.status !== "uploading")
    }

    handleOpenSettingsModal () {
        let modal = document.getElementById("settingsModal")
        modal.style.display = 'block'
    }

    handleCloseSettingsModal () {
        let modal = document.getElementById("settingsModal")
        modal.style.display = 'none'
    }

    render() {
        let isUploadButtonEnabled = this.isUploadButtonEnabled()
        let zones = this.storage.getZones()

        return (
            <div id="app">
                <head>
                    <title>Jarduino</title>
                </head>

                <body>
                    <header>
                        <h1 id="logo"></h1>
                        <div id="status">
                            <DeviceStatus status={this.state.status}
                                          onDeviceFound={this.handleDeviceFound}
                                          onDeviceNotFound={this.handleDeviceNotFound}
                                          onReadyForUpload={this.handleCodeUpload}
                            />
                        </div>

                        <div id="jarduino_controls">
                            <div id="buttons">
                                <SettingsButton
                                    onClick={this.handleOpenSettingsModal}
                                />
                                <UploadCodeToDeviceButton
                                    enabled={isUploadButtonEnabled}
                                    onClick={this.uploadCodeToDevice}
                                />
                            </div>
                        </div>
                    </header>

                    <SettingsModal
                        isOpen={this.state.showSettingsModal}
                        onClose={this.handleCloseSettingsModal}
                        zones={zones}
                        ref="modal"
                    />

                    <div id="main">
                        <Zones
                            onZonesUpdated={this.handleZonesUpdated}
                            data={this.state.zonesData}
                        />
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
