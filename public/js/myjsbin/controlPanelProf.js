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
    "matricola"/*,
    "html",
    "javascript",
    "css",
    "examUrl",
    "error_Html",
    "error_Javascript",
    "error_Css",
    "failure_Mocha",
    "pass_Mocha",
    "proposal_vote"*/
];



$(document).ready(mainFunction);

function mainFunction() {

    $('li[id$="-tab"]').click(function(event){
        if ($(this).hasClass('disabled')) {
            return false;
        }
    });

    //gestione submit form upload file per esame
    $("#formExamFile").submit(function(event) {
        event.preventDefault();
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
                    if (res.ok) {
                        fileUploaded = true;
                        alert(res.string);
                    } else {
                        alert(res);
                    }
                },
                error: function () {
                    alert("Si è verificato un problema contattando il server al servizio \n"+url);
                }
            });
        } else {
            alert("attenzione!!! estensione file errata");
        }
    });

    //gestione submit form caricamento duranta esame e tempo di over time (quanto è di manica larga il professore)
    $("#formSetupClock").submit(function(event) {
        event.preventDefault();
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
                success: function (response) {
                    if (response.ok) {
                        clockUploaded = true;
                        alert("Valori Temporizzazione compito aggiornati con successo");
                    } else {
                        alert("Non è stato possibile caricare i valori della Temporizzazione del compito, riprovare più tardi");
                    }
                },
                error: function () {
                    alert("Si è verificato un problema contattando il server al servizio \n"+url);
                }
            });
        } else {
            alert("Attenzione!!! \nInserire dei valori numerici nei campi del form");
        }
    });

    //richiedo lo stato interno del clock del server, per capire come sono messo
    callForClockAulaStatus();

    /*
     gestione click pulsanti per settare il clock interno al server
     SETUP : per fare in modo che gli alunni possano registrarsi
     READY : per dire al server che tra 5 secondi deve far partire la sessione di esame
     NOTEST : per accertare la fine dell'attuale sessione di esame e riportare il sistema allo stato di default (possibile solo quando si ha terminato l'attuale sessione di esame)
     */
    $("button[id^='btnClock']").click(function (){
        var data = {
            status: this.value
        };

        var confirmRequest = true;

        if (this.value === "setup"){
            if (!fileUploaded || !clockUploaded){
                var message = "ATTENZIONE\n\n";
                if (!fileUploaded){
                    message += "- testo esami non caricato\n";
                }
                if (!clockUploaded){
                    message += "- durata esame non caricata\n";
                }
                message += "\nIn caso di conferma, il compito inizierà\n" +
                    "con i valori di Default visibili\n" +
                    "nella schermata";
                confirmRequest = confirm(message);
            }
        }
        if (confirmRequest) {
            setClockAulaStatus(data);
        }
    });

    $("#btnResetExamSession").click(function() {
        var data = {
            status: "notest"
        };
        setClockAulaStatus(data);
    });

    //handle the request by the professor for clear all of the exam's text file
    $("#btnClearExamFile").click(function (){

        var message = "Sei sicuro di voler pulire i file del compito?\n" +
            "in questo modo le schermate dello studente relative a:\n > html\n > javascript\n > css\n" +
            "saranno completamente vuote";
        var confirmRequest = confirm(message);

        if (confirmRequest) {
            $.ajax({
                url: "clearDefaultFile", //this is the right route
                dataType: "json",
                type: "POST",
                success: function (response) { //TODO here I need a switch block to manage different clock status
                    console.log(response);
                    //$("#spanStatusClock").text(response.status);
                    //REMEMBER I only switch between two state, setup and ready, the two states that are manageable by the professor
                    if (response.ok){
                        alert(response.message);
                    } else {
                        alert("Si è verificato un errore nel passaggio allo stato di : "+data.status.toUpperCase());
                    }
                },

                error: function () {
                    alert("Si è verificato un problema");
                }
            });
        }
    });

    //gestione click pulsante che ritorna tutti gli studenti che hanno terminato l'esame di oggi
    $("#btnGetFinishStudent").click(function() {
        //call the service that return all student that have finish
        $.ajax({
            url: "/getFinishStudent",
            dataType: "json",
            success: function (res) {
                console.log(res);
                alert(res);
                if (!res.length) {
                    $("#divNobodyFinishExam").show();
                } else {
                    $("#divNobodyFinishExam").hide();
                    var $divExamReport = $("#divExamReport");
                    var $thead = $("#tableExamReport thead");
                    var $tbody = $("#tableExamReport tbody");
                    $thead.empty();
                    $tbody.empty();

                    var tmp;
                    var tableHeader = "<tr>";
                    for (var y = 0; y < headersTableReport.length; y++) {
                        tableHeader += "<th>" + headersTableReport[y].replace("_", " ") + "</th>";
                    }
                    tableHeader += "</tr>";
                    $thead.append(tableHeader);

                    var tableRow;
                    for (var i = 0; i < res.length; i++) {
                        tmp = res[i];
                        tableRow = "<tr>";

                        for (var z = 0; z < headersTableReport.length; z++) {
                            //tableRow += "<td>"+  htmlEntities(tmp[headersTableReport[z]])+"</td>";
                            tableRow += "<td>" + tmp[headersTableReport[z]] + "</td>";
                        }
                        tableRow += "</tr>";
                        $tbody.append(tableRow);
                    }
                    $divExamReport.show();

                }
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
                        break;
                    case "setup":
                        $("#setup-tab").attr('class', 'disabled');
                        $("#start-tab").attr('class', 'active');
                        $('div[class*="tab-pane"]').removeClass("active in");
                        $('#start').addClass('in active');
                        break;
                    case "over":
                        $("#divRestartExamSession").show();
                    case "almostover":
                    case "overtime":
                    case "ready":
                        $("#setup-tab").attr('class', 'disabled');
                        $("#start-tab").attr('class', 'disabled');
                        $("#examInfo-tab").attr('class', 'active');
                        $('div[class*="tab-pane"]').removeClass("active in");
                        $('#examInfo').addClass('in active');
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
            if (response.ok){
                switch (data.status){
                    case "setup":
                        $("#setup-tab").attr('class', 'disabled');
                        $("#start-tab").attr('class', 'active');
                        $('div[class*="tab-pane"]').removeClass("active in");
                        $('#start').addClass('in active');
                        break;
                    case "ready":
                        $("#setup-tab").attr('class', 'disabled');
                        $("#start-tab").attr('class', 'disabled');
                        $("#examInfo-tab").attr('class', 'active');
                        $('div[class*="tab-pane"]').removeClass("active in");
                        $('#examInfo').addClass('in active');
                        break;
                    case "notest":
                        $("#setup-tab").attr('class', 'active');
                        $("#start-tab").attr('class', 'disabled');
                        $("#examInfo-tab").attr('class', 'disabled');
                        $('div[class*="tab-pane"]').removeClass("active in");
                        $('#setup').addClass('in active');
                        fileUploaded = false;
                        clockUploaded = false;
                        $("#divRestartExamSession").hide();
                        break;
                }
            } else {
                alert("Si è verificato un errore nel passaggio allo stato di : "+data.status.toUpperCase());
            }
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
        if (durationOverTime !== "" && durationOverTime >= 0){
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
        onComplete: function(second){
          alert("time is up");
          $("div[id^='Container_jbeeb']").css("background-color", "red");
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