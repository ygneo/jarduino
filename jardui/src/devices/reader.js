import pythonShell from 'python-shell'


class DeviceReader {
    constructor(props) {
        this.device = props.device

        this.startReading = this.startReading.bind(this);
        this.stopReading = this.stopReading.bind(this);
    }

    startReading(handlers) {
        this.pyshell = new pythonShell('jarduino.py', {"args": ["read"], "mode": "json"})

        this.pyshell.on('message', function (message) {
            console.log(message)
            handlers.onMessage(message)
        })

        this.pyshell.end(function (err) {
            if (err) {
                console.log(err)
                handlers.onError()
            }
        });
    }

    stopReading(handlers) {
        this.pyshell.childProcess.kill()
    }
}

export default DeviceReader
