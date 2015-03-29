/**
 * Created by Trappola on 02/10/2014.
 */

var myCountdown;
var clockStatus = null;

$(document).ready(mainFunction);

//TODO manage btnFinish click
function mainFunction() {

    createCountdownElement();

    $("#btnFinish").click(function() {
        var confirmDelivery = confirm("ATTENZIONE!!!\n Sei sicuro di voler consegnare il tuo esame???\n\n cliccando su OK consegnerai il tuo elaborato definitivamente,\ne questa sarà la versione che verrà corretta");
        if (confirmDelivery){
            deliveryExam();
        }
    });

    callForClockAulaStatus();
}

function callForClockAulaStatus(){
    $.ajax({
        url: "/getClockAula", //this is the right route
        dataType: "json",
        success: function (data) { //todo, qui penso ad un bello switch probabilmente

            if (data.status !== clockStatus){

                clockStatus = data.status;

                switch (clockStatus){
                    case "notest":
                    case "almostover":
                    case "overtime":
                    case "setup":
                    case "ready":
                        //$('#btnLogin').prop('disabled', true);
                        break;

                    case "over":
                        deliveryExam();
                        break;
                }
            }

            setTimeout(callForClockAulaStatus, 5000);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function createCountdownElement(){
    console.log(timeoutClassroomClock);
    myCountdown = new Countdown({
            time: timeoutClassroomClock,
            width:200,
            height:25,
            inline:true,
            hideLabels	: true,
            target: "spanCountdown",
            onComplete: function(){
                //alert("time is up");
                $("div[id^='Container_jbeeb']").css("background-color", "red");
            },
            hideLine: true,
            numbers		: 	{
            font 	: "Arial",
                color	: "#FFFFFF",
                bkgd	: "#ff8f00",
                rounded	: 0.15,
                shadow	: {
                x : 0,
                    y : 3,
                    s : 4,
                    c : "#000000",
                    a : 0.4
                }
            },
            labels : {
                font   : "Arial",
                    color  : "#a8a8a8",
                    weight : "normal" // < - no comma on last item!
            },
            rangeHi:"hour"	// <- no comma on last item!
        });
}

function deliveryExam(){
    var urlExam = location.pathname.split('/')[1];
    var examRevision = location.pathname.split('/')[2]

    var data = {
        urlExam: urlExam,
        examRevision: examRevision
    };
    $.ajax({
        url: "/deliveryExam", //this is the right route
        dataType: "json",
        type: "POST",
        data: data,
        success: function (response) { //TODO here I need a switch block to manage different clock status
            console.log(response);
            alert("esame consegnato con successo");
            window.location.href = response.finishPageUrl;
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}