import pythonShell from 'python-shell'


class DeviceReader {
    constructor(props) {
        this.device = props.device
    }

    startReading(handlers) {
        let pyshell = new pythonShell('jarduino.py', {"args": "read"})

        pyshell.on('message', function (message) {
            handlers.onMessage(message)
        })

        pyshell.on('error', function (error) {
            handlers.onError(error)
        })
    }

    stopReading(handlers) {
        this.pyshell.childProcess.kill()
    }
}

export default DeviceReader
