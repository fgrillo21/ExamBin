/**
 * Created by Trappola on 29/09/2014.
 */

var MILLIS2SEC = 1000;
var clockStatus = null;
var fileUploaded = false;
var clockUploaded = false;
var count = 2;
var len = 1;
var createObjJson = false;
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

    appendFilePresent();

    $('li[id$="-tab"]').click(function(event){
        if ($(this).hasClass('disabled')) {
            return false;
        }
    });

    //gestione submit form upload file per esame
    $("#btnExamFile").click(function(event) {
        event.preventDefault();
        var formData = new FormData($("#formExam")[0]);
        console.log(formData);
        var confirmInput = validateInputFile();

//        awesome, with this ajax call I update the exam's file choose by the professor
        if (confirmInput) {
            $.ajax({
                url: "uploadFileCustom",
                data: formData,
                type: 'POST',
                cache: false,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.ok) {
                        fileUploaded = true;
                        appendLastFile(res.path, res.name);
                        alert(res.string);
                    } else {
                        alert(res);
                    }
                },
                error: function () {
                    alert("Si è verificato un problema contattando il server al servizio \nuploadFileCustom");
                }
            });
        } else {
            alert("attenzione!!! estensione file errata");
        }
    });

    /* creazione file json - da sistemare */
    $("#btnClocksetup").click(function(){
        var obj = getValueToInput();
        var json = JSON.stringify(obj);
        if(createObjJson) {
            alert(json);
            $.ajax({
                url: "createFileJson",
                data: json,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: "POST",
                success: function (response) {
                    console.log(response);
                    if (response.ok) {
                        appendLastFile(response.path, response.name);
                    } else {
                        alert("Si è verificato un problema nel creare il file Json\n ");
                    }
                },

                error: function () {
                    alert("Si è verificato un problema (json file)");
                }
            });
        }
    });

    $('select').on('change', function(e){
        var path = $('option:selected', this).data('link');


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
            var message = "RIEPILOGO\n\n";
            if (fileUploaded === false && createObjJson === false) {
                alert("\nAttenzione, per procedere:\n - caricare un file json o \n - compilare il form con gli opportuni valori!");
            }
            else{
                if (!fileUploaded){
                    message += "- File json non caricato\n";
                }
                else{
                    message += "- File json caricato\n";
                }
                if (!createObjJson){
                    message += "- Oggetto json non creato\n";
                }
                else{
                    message += "- Oggetto json creato\n";
                }

                confirmRequest = confirm(message);
            }

        }
        if (confirmRequest) {
            setClockAulaStatus(data);
        }
    });

    /* inverte la domanda corrente con quella subito prima se esiste */
    $(document).on('click','.switchUp', function(){
        var button = $(this);
        switchUpQuestion(button);
    });

    /* inverte la domanda corrente con quella subito dopo se esiste */
    $(document).on('click','.switchDown', function(){
        var button = $(this);
        switchDownQuestion(button);
    });

    /* cancellazione domanda */
    $(document).on('click','.remove',function(){
        var button = $(this);
        remove(button);
    });

    /* aggiunta domanda */
    $(document).on('click','#btnAdd',function(){
        cloneDivQuestion();

    });

    $("#btnResetExamSession").click(function() {
        var data = {
            status: "notest"
        };
        setClockAulaStatus(data);
        $.ajax({
            url: "clearQuestionFile", //this is the right route
            dataType: "json",
            type: "POST",
            success: function (response) {
                console.log(response);
                /* azzero il valore dei campi di input */
                $("#fileHtmlUpload").val("");
                $("#fileCssUpload").val("");
                $("#fileJavascriptUpload").val("");
                if (response.ok){
                    alert(response.message);
                } else {
                    alert("Si è verificato nella richiesta\n ");
                }
            },

            error: function () {
                alert("Si è verificato un problema");
            }
        });
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
    if (fileUploaded === true || createObjJson === true) {
        $.ajax({
            url: "setClockAula", //this is the right route
            dataType: "json",
            type: "POST",
            data: data,
            success: function (response) { //TODO here I need a switch block to manage different clock status
                console.log(response);
                if (response.ok) {
                    switch (data.status) {
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
                            $('div[id*="text"]').addClass("active in");
                            $('#setup').addClass('in active');
                            fileUploaded = false;
                            clockUploaded = false;
                            createObjJson = false;
                            $("#divRestartExamSession").hide();
                            break;
                    }
                } else {
                    alert("Si è verificato un errore nel passaggio allo stato di : " + data.status.toUpperCase());
                }
            },

            error: function () {
                alert("Si è verificato un problema");
            }
        });
    }
}

function appendLastFile(path, name){
    $.ajax({
        url: "appendFile", //this is the right route
        dataType: "json",
        type: "POST",

        success: function (response) {
            console.log(response);
            if (response.ok){
                //$("#list").append("<li><a href="+path+"> Prova del "+name+"</a></li>");
                $('.list').append("<option data-link=\""+path+"\"> Prova del "+name+"</option>");
            } else {
                alert("Si è verificato un errore");
            }
        },
        error: function () {
            alert("Errore nella append");
        }
    });
}

function appendFilePresent(){
    $.ajax({
        url: "appendFile", //this is the right route
        dataType: "json",
        type: "POST",

        success: function (response) {
            console.log(response);
            if (response){
                var i;
                for(i=0; i<response.len; i++) {
                    //$("#list").append("<li><a href="+response.result[i]+">Prova del "+response.file[i]+"</a></li>");
                    $('.list').append("<option data-link=\""+response.result[i]+"\"> Prova del "+response.file[i]+"</option>");
                }
            } else {
                alert("Si è verificato un errore");
            }
        },
        error: function () {
            alert("Errore nella append");
        }
    });
}

function validateInputFile(){

    var ok = false;

    if ($("#fileJsonUpload").val().split('.').pop() === "json"){
        ok = true;
    }
    return ok;
}

function validateClockInput(){

    var ok = false;
    var durationTest = $("#inputDurationTest").val();
    var durationOverTime = $("#inputDurationOverTimeTest").val();
    if (durationTest !== "" && durationTest > 0 ){
        ok = true;
    }
    return ok;
}

function getValueToInput(){
    var objJson = {};
    var q = [];
    var name = document.getElementById("inputNameExam").value;
    if(name !== ""){
        var cover = document.getElementById("inputCoverExam").value;
        var objName= name;
        var objCover= cover.split("\n");
        JSON.stringify(objName);
        JSON.stringify(objCover);
        objJson.name = objName;
        objJson.cover = objCover;

        var i;
        for(i=1; i<=len; i++){
            var idText = "inputText"+i;
            var idHtml = "inputHtml"+i;
            var idCss = "inputCss"+i;
            var idJavascript = "inputJavascript"+i;
            var text = document.getElementById(idText).value;
            var html = document.getElementById(idHtml).value;
            var css = document.getElementById(idCss).value;
            var javascript = document.getElementById(idJavascript).value;
            var objQuestion = {
                text: text.split("\n"),
                html: html.split("\n"),
                css: css.split("\n"),
                javascript: javascript.split("\n")
            };
            JSON.stringify(objQuestion);
            objJson.question = q;
            q.push(objQuestion);
        }
        createObjJson = true;
        console.log("JSON: ", objJson);
        return objJson;
    }
}

function switchUpQuestion(button){
    var currentDivId = button.parent().parent().parent().attr('id');
    var sliceId = parseInt(currentDivId.slice(-1));

    var precId = sliceId - 1;
    var precDiv = document.getElementById("question"+precId);
    if(precDiv){
        /* salvo i valori della domanda corrente */
        var textCurrent = document.getElementById("inputText"+sliceId).value;
        var htmlCurrent = document.getElementById("inputHtml"+sliceId).value;
        var cssCurrent = document.getElementById("inputCss"+sliceId).value;
        var javascriptCurrent = document.getElementById("inputJavascript"+sliceId).value;
        /* salvo i valori della domanda precendente */
        var textPrec = document.getElementById("inputText"+precId).value;
        var htmlPrec = document.getElementById("inputHtml"+precId).value;
        var cssPrec = document.getElementById("inputCss"+precId).value;
        var javascriptPrec = document.getElementById("inputJavascript"+precId).value;

        /* la domanda corrente assume i valori di quella precedente e viceveresa */
        document.getElementById("inputText"+sliceId).value = textPrec;
        document.getElementById("inputHtml"+sliceId).value = htmlPrec;
        document.getElementById("inputCss"+sliceId).value = cssPrec;
        document.getElementById("inputJavascript"+sliceId).value = javascriptPrec;

        document.getElementById("inputText"+precId).value = textCurrent;
        document.getElementById("inputHtml"+precId).value = htmlCurrent;
        document.getElementById("inputCss"+precId).value = cssCurrent;
        document.getElementById("inputJavascript"+precId).value = javascriptCurrent;
    }
}

function switchDownQuestion(button){
    var currentDivId = button.parent().parent().parent().attr('id');
    var sliceId = parseInt(currentDivId.slice(-1));

    var succId = sliceId + 1;
    var succDiv = document.getElementById("question"+succId);
    if(succDiv){
        /* salvo i valori della domanda corrente */
        var textCurrent = document.getElementById("inputText"+sliceId).value;
        var htmlCurrent = document.getElementById("inputHtml"+sliceId).value;
        var cssCurrent = document.getElementById("inputCss"+sliceId).value;
        var javascriptCurrent = document.getElementById("inputJavascript"+sliceId).value;
        /* salvo i valori della domanda precendente */
        var textSucc = document.getElementById("inputText"+succId).value;
        var htmlSucc = document.getElementById("inputHtml"+succId).value;
        var cssSucc = document.getElementById("inputCss"+succId).value;
        var javascriptSucc = document.getElementById("inputJavascript"+succId).value;

        /* la domanda corrente assume i valori di quella successiva e viceveresa */
        document.getElementById("inputText"+sliceId).value = textSucc;
        document.getElementById("inputHtml"+sliceId).value = htmlSucc;
        document.getElementById("inputCss"+sliceId).value = cssSucc;
        document.getElementById("inputJavascript"+sliceId).value = javascriptSucc;

        document.getElementById("inputText"+succId).value = textCurrent;
        document.getElementById("inputHtml"+succId).value = htmlCurrent;
        document.getElementById("inputCss"+succId).value = cssCurrent;
        document.getElementById("inputJavascript"+succId).value = javascriptCurrent;
    }
}

function cloneDivQuestion(){
    /* salvo e clono il primo elemento ogni volta */
    var itm = document.getElementById("question1");
    var cln = itm.cloneNode(true);
    /* appendo l'elemento clonato alla fine */
    document.getElementById("formQuestion").appendChild(cln);
    /* MODIFICO gli ID nel nuovo elemento */
    updateId(cln);
    len++;
}

function remove(button){
    var divToRemove = button.parent().parent().parent();
    var idDivToRemove = button.parent().parent().parent().attr('id');
    var sliceId = idDivToRemove.slice(-1);
    count = parseInt(sliceId);

    /* Ciclo per aggiornare i valori e gli id dei div successivi, esempio:
     * Domanda 1
     * Domanda 2
     * Domanda 3
     * Domanda 4
     * Se viene cancellata la domanda 2, allora la 3 diventa la 2, la 4 diventa la 3, ecc. */
    var i;
    for(i=count; i<len; i++){
        var idNextDiv = count+1;
        var nextDiv = document.getElementById("question"+idNextDiv);
        updateId(nextDiv);
    }
    /* una volta aggiornati i valori cancello il div selezionato all'inizio */
    divToRemove.remove();
    len--;
}

function updateId(element){
    /* id e name */
    element.id = "question"+count;
    var currentDivId = element.id;
    console.log("div "+currentDivId);
    /* label */
    element.getElementsByTagName("label")[0].id = "label"+count;
    element.getElementsByTagName("label")[0].innerHTML = "Domanda n."+count;
    /* Ancore */
    element.getElementsByTagName("a")[0].href = "text"+count;
    element.getElementsByTagName("a")[1].href = "html"+count;
    element.getElementsByTagName("a")[2].href = "css"+count;
    element.getElementsByTagName("a")[3].href = "javascript"+count;
    /* id tab menu */
    element.getElementsByTagName("div")[2].id = "text"+count;
    element.getElementsByTagName("div")[3].id = "html"+count;
    element.getElementsByTagName("div")[4].id = "css"+count;
    element.getElementsByTagName("div")[5].id = "javascript"+count;
    /* textarea question */
    element.getElementsByTagName("textarea")[0].id = "inputText" + count;
    element.getElementsByTagName("textarea")[1].id = "inputHtml"+count;
    element.getElementsByTagName("textarea")[2].id = "inputCss"+count;
    element.getElementsByTagName("textarea")[3].id = "inputJavascript"+count;
    count++;
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