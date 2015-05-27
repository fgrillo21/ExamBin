/**
 * Created by Trappola on 15/10/2014.
 */
$(document).ready(mainFunction);

var clockStatus = null;
var timeout = 3000 + Math.floor(Math.random()*2000); //set the timeout for make the ajax request for the state of the classroom clock;
var examUrl = null;

function mainFunction() {
    callForClockAulaStatus();
    setupLoginStudent();
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
                        break;
                    case "start":
                        examUrl = data.url;
                        $('#btnList').css('display', 'inline-block');
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

function setupLoginStudent(){
    $.ajax({
        url: "setupLoginStudent",
        datatype: "json",
        type: "POST",
        success:function(data){
            if(data.ok){
                //alert(data.content);
                var res = JSON.parse(data.content);
                $('.log').append(res.cover);
            }
        },
        error: function () {
            alert("Errore setup Login Student");
        }
    });
}