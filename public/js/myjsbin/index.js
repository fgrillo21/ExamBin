/**
 * Created by Trappola on 02/10/2014.
 */

var myCountdown;

$(document).ready(mainFunction);

//TODO manage btnFinish click
function mainFunction() {
    createCountdownElement();

    $("#btnFinish").click(function() {
        console.log(location.pathname);
        console.log(location.pathname.split('/')[1]);

        var urlExam = location.pathname.split('/')[1];

        var data = {
            urlExam: urlExam
        }
        $.ajax({
            url: "/deliveryExam", //this is the right route
            dataType: "json",
            type: "POST",
            data: data,
            success: function (response) { //TODO here I need a switch block to manage different clock status
                console.log(response);
                alert(response);
            },

            error: function () {
                alert("Si è verificato un problema");
            }
        });
    });
}

function callServiceClock(){

    console.log(location.protocol+"://"+location.hostname+":"+location.port+"/getClockAula");
    $.ajax({
        url: location.protocol+"://"+location.hostname+"/getClockAula", //this is the right route
        dataType: "json",
        success: function (data) { //todo, qui penso ad un bello switch probabilmente
            console.log(data.status);
            if (data.status === "notest"){
                console.log("Non ci si può registrare poichè non siamo in una sessione di test");
                alert("Yuppi");
                //setTimeout(callServiceClock,15000);
            }

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
            target: spanCountdown,
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