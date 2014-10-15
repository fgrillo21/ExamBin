/**
 * Created by Trappola on 15/10/2014.
 */
$(document).ready(mainFunction);

var clockStatus = null;
var timeout = 3000 + Math.floor(Math.random()*2000); //set the timeout for make the ajax request for the state of the classroom clock;
var examUrl = null;

function mainFunction() {
    callForClockAulaStatus();
}

function callForClockAulaStatus() {

    $.ajax({
        url: "getClockAula", //this is the right route
        dataType: "json",
        success: function (data) { //TODO here I need a switch block to manage different clock status
            console.log("dati arrivati")
            console.log(data);
            if (data.status !== clockStatus){
                clockStatus = data.status;
                switch (clockStatus){
                    case "ready":
                        timeout = 500 + Math.floor(Math.random()*500);
                        examUrl = data.url;
                        break;
                    case "start":
                        examUrl = data.url;
                        window.location.href = examUrl;
                        break;
                }
            }
            var cookie = document.cookie;
            console.log(cookie);
            setTimeout(callForClockAulaStatus, timeout);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}
