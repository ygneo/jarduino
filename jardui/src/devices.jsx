import React from 'react'
import ReactDOM from 'react-dom'
import pythonShell from 'python-shell'


class DeviceStatus extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            "status": props.status,
            "device_found": false
        }

        this.searching_device_statuses = ["searching", "detection_error"]
        this.status_className = {
            "searching": "",
            "detection_error": "error",
            "changes_ready": "error",
            "success": "success"
        }

        this.handleDetected = this.handleDetected.bind(this)
        this.handleDetectionError = this.handleDetectionError.bind(this)
        this.handleArduinoDetection = this.handleArduinoDetection.bind(this)

        this.searchingDevice = this.searchingDevice.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        if (this.searchingDevice() === false) {
            this.setState({
                "status": nextProps.status
            })
        }
    }

    componentDidMount() {
        setInterval(this.handleArduinoDetection, 2000)
    }

    searchingDevice() {
        return (this.searching_device_statuses.includes(this.state.status))
    }

    handleArduinoDetection() {
        let handlers  = {
            onDetected: this.handleDetected,
            onError: this.handleDetectionError
        }

        detectArduinoDevice(handlers)
    }

    handleDetected(deviceName) {
        if (this.searchingDevice() === true) {
            this.setState({
                "status": "success",
                "deviceName": deviceName
            })

            this.props.onDeviceFound()
        }
    }

    handleDetectionError() {
        this.setState({
            "status": "detection_error"
        })

        this.props.onDeviceNotFound()
    }

    render () {
        let statusMessage = {
            "success": "Dispositivo Arduino detectado (" + this.state.deviceName + ")",
            "detection_error": "No se ha detectado ningún dispositivo Arduino",
            "changes_ready": "Para que los cambios tengan efecto es necesario reprogramar Arduino.",
            "updated": "El dispositivo Arduino ha sido reprogramado"
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


function detectArduinoDevice(handlers) {
    let pyshell = new pythonShell('jarduino.py', {"args": ["detect"]});

    pyshell.on('message', function (deviceName) {
        handlers.onDetected(deviceName)
    })

    pyshell.on('error', function (message) {
        handlers.onError(message)
    })

}


export default DeviceStatus
