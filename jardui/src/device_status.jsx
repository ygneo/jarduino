import React from 'react'
import ReactDOM from 'react-dom'
import DeviceSearcher from './device_searcher.js'


class DeviceStatus extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            "status": props.status,
            "found": false
        }

        this.deviceSearcher = new DeviceSearcher

        this.searching_device_statuses = ["searching", "detection_error"]
        this.status_className = {
            "searching": "",
            "uploading": "",
            "detection_error": "error",
            "changes_ready": "error",
            "changes_upload_error": "error",
            "changes_uploaded": "success",
            "success": "success"
        }

        this.handleDetected = this.handleDetected.bind(this)
        this.handleDetectionError = this.handleDetectionError.bind(this)
        this.startDeviceSearch = this.startDeviceSearch.bind(this)
        this.stoptDeviceSearch = this.stopDeviceSearch.bind(this)

        this.startDeviceSearch()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            "status": nextProps.status
        })

        if (nextProps.status === "searching" ||
            nextProps.status === "changes_uploaded"
        ) {
            this.startDeviceSearch()
        } else if (nextProps.status === "uploading") {
            this.stopDeviceSearch()
            this.props.onReadyForUpload()
        }
    }

    startDeviceSearch() {
        let handlers  = {
            onDetected: this.handleDetected,
            onError: this.handleDetectionError
        }

        this.deviceSearcher.startSearch(handlers)
    }

    stopDeviceSearch() {
        this.deviceSearcher.stopSearch()
    }

    handleDetected(device) {
        this.stopDeviceSearch()
        if (this.state.found === false) {
            this.setState({
                "status": "success",
                "deviceName": device.name,
                "found": true
            })

            this.props.onDeviceFound(device)
        }
    }

    handleDetectionError() {
        this.setState({
            "status": "detection_error",
            "found": false
        })

        this.props.onDeviceNotFound()
    }

    render() {
        let statusMessage = {
            "success": "Dispositivo Arduino detectado (" + this.state.deviceName + ")",
            "detection_error": "No se ha detectado ningún dispositivo Arduino",
            "changes_ready": "Para que los cambios tengan efecto es necesario reprogramar Arduino",
            "changes_uploaded": "El dispositivo Arduino ha sido reprogramado",
            "changes_upload_error": "Error intentando reprogramar el dispositivo Arduino",
            "uploading": "Reprogramando Arduino... (" + this.state.deviceName + ")"
        }
        let msg = statusMessage[this.state.status]
        let className = this.status_className[this.state.status]

        return  (
            <div className={className}>
                <span id="icon"></span>
                <span id="msg">{msg}</span>
            </div>
        )
    }
}


export default DeviceStatus
