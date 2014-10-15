/**
 * Created by Trappola on 29/09/2014.
 */

var MILLIS2SEC = 1000;
var MINUTE2MILLIS = 60000;
var clockStatus = null;
var fileUploaded = false;
var clockUploaded = false;
var countdownTime = 0;
var headersTableReport = [
    "name",
    "surname",
    "matricola",
    //"html",
    //"javascript",
    //"css",
    "examUrl",
    "error_Html",
    "error_Javascript",
    "error_Css",
    "failure_Mocha",
    "pass_Mocha",
    "proposal_vote"
];



$(document).ready(mainFunction);

function mainFunction() {

    $("#formExamFile").submit(function(event) {
        /* stop form from submitting normally */
        event.preventDefault();

        /* get some values from elements on the page: */
        var $form = $( this ),
            url = $form.attr( 'action' );
        var formData = new FormData($(this)[0]);

        var confirmInput = validateInputFile();

//        awesome, with this ajax call I update the exam's file choose by the professor
        if (confirmInput) {
            $.ajax({
                url: url,
                data: formData,
                type: 'POST',
                cache: false,
                contentType: false,
                processData: false,
                success: function (res) {
                    console.log(res);
                    fileUploaded = true;
                    alert(res);
                },
                error: function () {
                    alert("Si è verificato un problema");
                }
            });
        } else {
            alert("attenzione!!! estensione file errata");
        }
    });

    $("#formSetupClock").submit(function(event) {
        /* stop form from submitting normally */
        event.preventDefault();

        /* get some values from elements on the page: */
        var $form = $( this ),
            url = $form.attr( 'action' );
        var formData = new FormData($(this)[0]);

        var confirmInput = validateClockInput();

        if (confirmInput) {
            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) { //TODO here I need a switch block to manage different clock status
                    console.log(response);
                    clockUploaded = true;
                    alert(res);
                },
                error: function () {
                    alert("Si è verificato un problema");
                }
            });
        } else {
            alert("Attenzione!!! \nInserire dei valori numerici nei campi del form");
        }
    });

    createCountdownObject(countdownTime);

    setTimeout(callForClockAulaStatus, 5000);

    $("button[id^='btnClock']").click(function (){
        var data = {
            status: this.value
        }

        var confirmRequest = true;

        if (this.value === "setup"){
            if (!fileUploaded || !clockUploaded){
                var message = "ATTENZIONE\n\n";
                if (!fileUploaded){
                    message += "- testo esami non caricato\n";
                }
                if (!clockUploaded){
                    message += "- testo esami non caricato\n";
                }
                confirmRequest = confirm(message);
            }
        }
        if (confirmRequest) {
            setClockAulaStatus(data);
        }
    });

    $("#btnGetStudentReport").click(function() {
        //call the service that return all
        $.ajax({
            url: "getStudentReport",
            dataType: "json",
            success: function (res) {
                console.log(res);
                alert(res);
                var $divExamReport = $("#divExamReport");
                var $thead = $("#tableExamReport thead");
                var $tbody = $("#tableExamReport tbody");
                $thead.empty();
                $tbody.empty();

                var tmp;
                var tableHeader = "<tr>";
                for (var y = 0; y < headersTableReport.length ;y++){
                    tableHeader += "<th>"+headersTableReport[y].replace("_"," ")+"</th>";
                }
                tableHeader += "</tr>";
                $thead.append(tableHeader);

                var tableRow;
                for (var i = 0; i < res.length;i++){
                    tmp = res[i];
                    tableRow = "<tr>";

                    for (var z = 0; z < headersTableReport.length ;z++){
                        //tableRow += "<td>"+  htmlEntities(tmp[headersTableReport[z]])+"</td>";
                        tableRow += "<td>"+  tmp[headersTableReport[z]]+"</td>";
                    }
                    tableRow += "</tr>";
                    $tbody.append(tableRow);
                }
                $divExamReport.show();
            },
            error: function () {
                alert("Si è verificato un problema");
            }
        })
    });
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function callForClockAulaStatus() {
    console.log(location.protocol+"//"+location.hostname+":"+location.port+"/getClockAula");
    $.ajax({
        url: "getClockAula", //this is the right route
        dataType: "json",
        success: function (data) { //TODO here I need a switch block to manage different clock status
            console.log(data);
            if (data.status !== clockStatus){

                clockStatus = data.status;
                $("#spanStatusClock").text(data.status);

                switch (clockStatus){
                    case "notest":
                    case "almostover":
                    case "overtime":
                    case "over":
                    case "setup":
                    case "ready":
                        //$('#btnLogin').prop('disabled', true);
                        break;

                    case "start":
                        countdownTime = data.timeout;
                        createCountdownObject(countdownTime);
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

function setClockAulaStatus(data) {

    $.ajax({
        url: "setClockAula", //this is the right route
        dataType: "json",
        type: "POST",
        data: data,
        success: function (response) { //TODO here I need a switch block to manage different clock status
            console.log(response);
            //$("#spanStatusClock").text(response.status);
            //REMEMBER I only switch between two state, setup and ready, the two states that are manageable by the professor
            switch (data.status){
                case "setup":
                    $("#btnClocksetup").attr('disabled', true);
                    $("#btnClockready").attr('disabled', false);
                    break;
                case "ready":
                    $("#btnClockready").attr('disabled', true);
                    break;
            }
            //setTimeout(callForClockAulaStatus, 3000);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function validateInputFile(){

    var ok = false;

    if ($("#fileHtmlUpload").val().split('.').pop() === "html"){
        if ($("#fileCssUpload").val().split('.').pop() === "css"){
            if ($("#fileJavascriptUpload").val().split('.').pop() === "js"){
                ok = true;
            }
        }
    }
    return ok;
}

function validateClockInput(){

    var ok = false;
    var durationTest = $("#inputDurationTest").val();
    var durationOverTime = $("#inputDurationOverTimeTest").val();
    if (durationTest !== "" && durationTest > 0 ){
        if (durationOverTime !== "" && durationOverTime > 0){
            ok = true;
        }
    }
    return ok;
}

function createCountdownObject(millisec){

    var second = millisec / MILLIS2SEC;
    console.log(second);
    $("#divCountdown").empty();

    var myCountdown2 = new Countdown({
        time: second,
        //style: "flip",
        width:300,
        height:80,
        inline:true,
        hideLine: true,
        onComplete: function(){
          //TODO try to manage in a best way this function call when the countdown finish your work
          alert("time is up");
        },
        target: "divCountdown", // perfetc, with this property I can set the father element where attach th countdown element, created from library
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