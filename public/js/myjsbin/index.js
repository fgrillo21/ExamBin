/**
 * Created by Trappola on 02/10/2014.
 */

var myCountdown;
var clockStatus = null;

$(document).ready(mainFunction);

//TODO manage btnFinish click
function mainFunction() {

    createCountdownElement();

    callForClockAulaStatus();
}

function callForClockAulaStatus(){
    $.ajax({
        url: "/getClockAula",
        dataType: "json",
        success: function (data) {
            if (data.status !== clockStatus){
                clockStatus = data.status;

                switch (clockStatus){
                    case "notest":
                    case "almostover":
                    case "overtime":
                    case "setup":
                    case "ready":
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
                bkgd	: "#1E90FF",
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