import pythonShell from 'python-shell'


class DeviceReader {
    constructor(props) {
        this.device = props.device
    }

    startReading(handlers) {
        this.pyshell = new pythonShell('jarduino.py', {"args": "read", "mode": "json"})


        this.pyshell.on('message', function (message) {
            console.log(message)
            handlers.onMessage(message)
        })

        this.pyshell.on('error', function (error) {
            console.log(error)
            handlers.onError(error)
        })
    }

    stopReading(handlers) {
        this.pyshell.childProcess.kill()
    }
}

export default DeviceReader
