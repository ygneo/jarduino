function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


export default function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var year = a.getUTCFullYear();
    var month = months[a.getUTCMonth()];
    var date = a.getUTCDate();
    var hour = a.getUTCHours();
    var min = zeroPadding(a.getUTCMinutes());
    var sec = zeroPadding(a.getUTCSeconds());
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

    return time;
}
