function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


export default function timeConverter(UNIX_timestamp, utc=true, secs=true, only_time=false) {
    let a = new Date(UNIX_timestamp * 1000)
    let months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

    let year = a.getFullYear()
    let month = months[a.getMonth()]
    let date = a.getDate()
    let hour = a.getHours()
    let min = zeroPadding(a.getMinutes())
    let sec = zeroPadding(a.getSeconds())

    if (utc) {
        year = a.getUTCFullYear()
        month = months[a.getUTCMonth()]
        date = a.getUTCDate()
        hour = a.getUTCHours()
        min = zeroPadding(a.getUTCMinutes())
        sec = zeroPadding(a.getUTCSeconds())
    }

    
    let time = date + ' ' + month + ' ' + year + '  ' + hour + ':' + min
    if (secs) {
        time +=  ':' + sec 
    }

    if (only_time) {
        time = hour + ':' + min + ":" + sec
    }

    return time
}
