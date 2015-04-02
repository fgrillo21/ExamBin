$(document).ready(mainFunction);

var clockStatus = null;
var timeout = 3000 + Math.floor(Math.random()*2000); //set the timeout for make the ajax request for the state of the classroom clock;
var examUrl = null;

function mainFunction() {
    callForClockAulaStatus();
}

function callForClockAulaStatus() {

    $.ajax({
        url: "getClockAula",
        dataType: "json",
        success: function (data) {
            console.log("dati arrivati");
            console.log(data);
            if (data.status !== clockStatus){
                clockStatus = data.status;
                switch (clockStatus){
                    case "ready":
                        timeout = 500 + Math.floor(Math.random()*500);
                        console.log("READY "+data.url);
                        examUrl = data.url;
                        break;
                    case "start":
                        examUrl = data.url;
                        console.log("START "+data.url);
                        window.location.href = examUrl;
                        break;
                }
            }
            var cookie = document.cookie;
            console.log("COOOKIIIIE "+cookie);
            setTimeout(callForClockAulaStatus, timeout);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}