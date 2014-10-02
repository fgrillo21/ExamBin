/**
 * Created by Trappola on 02/10/2014.
 */

$(document).ready(mainFunction);

function mainFunction() {

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
                setTimeout(callServiceClock,15000);
            }

        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}