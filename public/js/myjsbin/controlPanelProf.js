/**
 * Created by Trappola on 29/09/2014.
 */

var MILLIS2SEC = 1000;
var clockStatus = null;
var fileUploaded = false;
var clockUploaded = false;
var fileSelect = false;
var count = 2; /* contatore degli id delle domande, parte da due perché la prima è già presente */
var studentLog = 0;
var len = 1; /*numero di div (domande) presenti*/
var createObjJson = false;
var countdownTime = 0;
var overTime = 0;
var selectNumber = 1;
var headersTableReport = [
    "name",
    "surname",
    "matricola",
    "postazione"
    /*,
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
    $(document).on('click','#btnExamFile', function(event){
        event.preventDefault();
        var formData = new FormData($("#formExam")[0]);
        console.log(formData);
        var confirmInput = validateInputFile();

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

    /* creazione file json */
    $(document).on('click','#btnSave', function(){
        var obj = getValueToInput();
        var json = JSON.stringify(obj);
        if(createObjJson) {
            //alert(json);
            $.ajax({
                url: "createFileJson",
                data: json,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: "POST",
                success: function (response) {
                    console.log(response);
                    if (response.ok){
                        appendLastFile(response.path, response.name);
                        alert("File json creato con successo");
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

    /* gestione selezione di un file dalla lista */
   $('select').on('change', function(e){
       var path = $('option:selected', this).data('link');
       var obj = {};
       obj.linkTo = JSON.stringify(path);
       //alert(json);
       $.ajax({
           url: "getValueFileJson",
           data: obj,
           dataType: "json",
           type: "POST",
           success: function (response) {
               console.log(response);
               if (response.ok) {
                   //alert(response.content);
                   var res = JSON.parse(response.content);
                   getFromFile(res.name, res.cover, res.question);
                   fileSelect = true;

               } else {
                   alert("errore getValueFileJson\n ");
               }
           },

           error: function () {
               alert("Si è verificato un problema nel recupero dei dati dal json");
           }
       });
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

        var confirmRequest = false;

        if (this.value === "setup"){
            var message = "RIEPILOGO\n\n";
            if (fileUploaded === false && createObjJson === false) {
                alert("\nAttenzione:\n - caricare un file json o \n - compilare il form con gli opportuni valori!\n");
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

    /* gestione click sul tab "domanda" */
    $(document).on('click','li.litext', function(){
        var href = $(this).children().attr("href");
        var idtext = "text"+href.slice(-1);
        var idhtml = "html"+href.slice(-1);
        var idcss = "css"+href.slice(-1);
        var idjavascript = "javascript"+href.slice(-1);
        var text = document.getElementById(idtext);
        var html = document.getElementById(idhtml);
        var css = document.getElementById(idcss);
        var javascript = document.getElementById(idjavascript);
        $(text).addClass("active in");
        $(html).removeClass("active in");
        $(css).removeClass("active in");
        $(javascript).removeClass("active in");
    });

    /* gestione click sul tab "html" */
    $(document).on('click','li.lihtml', function(){
        var href = $(this).children().attr("href");
        var idtext = "text"+href.slice(-1);
        var idhtml = "html"+href.slice(-1);
        var idcss = "css"+href.slice(-1);
        var idjavascript = "javascript"+href.slice(-1);
        var text = document.getElementById(idtext);
        var html = document.getElementById(idhtml);
        var css = document.getElementById(idcss);
        var javascript = document.getElementById(idjavascript);
        $(text).removeClass("active in");
        $(html).addClass("active in");
        $(css).removeClass("active in");
        $(javascript).removeClass("active in");
    });

    /* gestione click sul tab "css" */
    $(document).on('click','li.licss', function(){
        var href = $(this).children().attr("href");
        var idtext = "text"+href.slice(-1);
        var idhtml = "html"+href.slice(-1);
        var idcss = "css"+href.slice(-1);
        var idjavascript = "javascript"+href.slice(-1);
        var text = document.getElementById(idtext);
        var html = document.getElementById(idhtml);
        var css = document.getElementById(idcss);
        var javascript = document.getElementById(idjavascript);
        $(text).removeClass("active in");
        $(html).removeClass("active in");
        $(css).addClass("active in");
        $(javascript).removeClass("active in");
    });

    /* gestione click sul tab "javascript" */
    $(document).on('click','li.lijavascript', function(){
        var href = $(this).children().attr("href");
        var idtext = "text"+href.slice(-1);
        var idhtml = "html"+href.slice(-1);
        var idcss = "css"+href.slice(-1);
        var idjavascript = "javascript"+href.slice(-1);
        var text = document.getElementById(idtext);
        var html = document.getElementById(idhtml);
        var css = document.getElementById(idcss);
        var javascript = document.getElementById(idjavascript);
        $(text).removeClass("active in");
        $(html).removeClass("active in");
        $(css).removeClass("active in");
        $(javascript).addClass("active in");
    });

    /*gestione bottoni per estendere la durata della prova d'esame */
    $(document).on('click','#btnExstendOne', function(){
        $.ajax({
            url: "setDataOverTimeOne",
            dataType: "json",
            type: "POST",
            success: function (response) {
                if (response.ok) {
                    overTime += 1;
                    $("#divInfoTime").show();
                    $("#spanInfoTime").text(overTime);
                } else {
                    alert("Non è stato possibile caricare i valori della Temporizzazione del compito, riprovare più tardi");
                }
            },
            error: function () {
                alert("Si è verificato un problema");
            }
        });
    });

    $(document).on('click','#btnExstendFive', function(){
        $.ajax({
            url: "setDataOverTimeFive",
            dataType: "json",
            type: "POST",
            success: function (response) {
                if (response.ok) {
                    overTime += 5;
                    $("#divInfoTime").show();
                    $("#spanInfoTime").text(overTime);
                } else {
                    alert("Non è stato possibile caricare i valori della Temporizzazione del compito, riprovare più tardi");
                }
            },
            error: function () {
                alert("Si è verificato un problema");
            }
        });
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

    /* crea una copia dell'esame */
    $("#btnCopy").click(function() {
        if (fileSelect){
            var obj = getValueToInput();
            var json = JSON.stringify(obj);
            $.ajax({
                url: "createCopy",
                data: json,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: "POST",
                success: function (response) {
                    console.log(response);
                    if (response.ok) {
                        //alert(response.message);
                        appendLastFile(response.path, response.name);
                    } else {
                        alert("Si è verificato un problema nel creare la copia del file Json\n ");
                    }
                },
                error: function () {
                    alert("Selezionare dalla lista il file del quale si vuole fare\n una copia ed eventualmente modificarlo");
                }
            });
        }
        else{
            alert("Per creare una copia bisogna selezionare un file\n dalla lista, se invece si vogliono inserire dei valori\n e poi salvarli il" +
            "tasto giusto è 'salva configurazione'");
        }
    });

    $("#btnClockready").click(function() {
        if(studentLog > 0){
            var data = {
                status: "ready"
            };
            setClockAulaStatus(data);
        }
        else{
            alert("Attendere il login di almeno uno studente prima di poter dare il via alla prova!");
        }
    });

    /* Forza terminazione esame */
    $("#btnResetExamSession").click(function() {
        var data = {
            status: "notest"
        };
        setClockAulaStatus(data);
    });

}

function callForClockAulaStatus() {
    console.log(location.protocol+"//"+location.hostname+":"+location.port+"/getClockAula");
    $.ajax({
        url: "getClockAula", //this is the right route
        dataType: "json",
        success: function (data) {
            if (data.status !== clockStatus){

                clockStatus = data.status;
                $("#spanStatusClock").text(data.status);
                $(".titleExam").text("Prova esame del "+getDataItalianFormat());

                switch (clockStatus){
                    case "notest":
                        break;
                    case "setup":
                        $('#btnClockready').attr('class', 'btn btn-primary btn-lg active');
                        break;
                    case "over":
                        $("#divInfoTime").hide();
                        $('#btnSubmitClockData').attr('class', 'btn btn-default active');
                        $('#btnClocksetup').attr('class', 'btn btn-primary btn-lg active');
                    case "almostover":
                    case "overtime":
                        countdownTime = data.durationOverTime;
                        createCountdownObject(countdownTime);
                    case "ready":
                        break;

                    case "start":
                        countdownTime = data.timeout;
                        createCountdownObject(countdownTime);
                        $('#btnSubmitClockData').attr('class', 'btn btn-default disabled');
                        $('#btnClocksetup').attr('class', 'btn btn-primary btn-lg disabled');
                        $('#btnClockready').attr('class', 'btn btn-primary btn-lg disabled');
                        break;
                }
            }

            setTimeout(callForClockAulaStatus, 5000);
            setTimeout(updateTableFinish,5000);
            //setTimeout(updateTable, 2000);
            updateTable();
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function setClockAulaStatus(data) {
    $.ajax({
        url: "setClockAula",
        dataType: "json",
        type: "POST",
        data: data,
        success: function (response) {
            console.log(response);
            if (response.ok) {
                switch (data.status) {
                    case "setup":
                    case "ready":
                        $('#hours').text(getHours());
                        break;
                    case "notest":
                        fileUploaded = false;
                        fileSelect = false;
                        clockUploaded = false;
                        createObjJson = false;
                        createCountdownObject(0);
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

function appendLastFile(path, name){
    $.ajax({
        url: "appendFile", //this is the right route
        dataType: "json",
        type: "POST",

        success: function (response) {
            console.log(response);
            if (response.ok){
                $('.list').append("<option th=\"select"+selectNumber+"\" data-link=\""+path+"\">"+name+"</option>");
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
        url: "appendFile",
        dataType: "json",
        type: "POST",

        success: function (response) {
            console.log(response);
            if (response){
                var i;
                for(i=0; i<response.len; i++) {
                    $('.list').append("<option id=\"select"+selectNumber+"\" data-link=\""+response.result[i]+"\">"+response.file[i]+"</option>");
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
    if (durationTest !== "" && durationTest > 0 ){
        ok = true;
    }
    return ok;
}

function getValueToInput(){
    var objJson = {};
    var q = [];
    var objQuestion = {};
    var name = document.getElementById("inputNameExam").value;
    if(name !== ""){
        var cover = document.getElementById("inputCoverExam").value;
        var objName= name;
        var objCover= cover.split("\n");
        JSON.stringify(objName);
        JSON.stringify(objCover);
        objJson.name = objName;
        objJson.cover = objCover;

        for(var i=1; i<=len; i++) {
            var divChoise = [];
            var c1 = document.getElementById("choisea"+i).value;
            var c2 = document.getElementById("choiseb"+i).value;
            var c3 = document.getElementById("choisec"+i).value;
            var c4 = document.getElementById("choised"+i).value;
            divChoise.push(c1);
            divChoise.push(c2);
            divChoise.push(c3);
            divChoise.push(c4);
            var text = document.getElementById("inputText"+i).value;
            var html = document.getElementById("inputHtml"+i).value;
            var css = document.getElementById("inputCss"+i).value;
            var javascript = document.getElementById("inputJavascript"+i).value;

            var typeQuestion = document.getElementById("choiseTypeQuestion"+i).value;
            /* domanda a risposta aperta */
            if(typeQuestion === "text"){
                objQuestion = {
                    type: "text",
                    text: text.split("\n")
                };
                objJson.question = q;
                q.push(objQuestion);
            }
            /* domanda che necessita della presenza di jbin */
            else if(typeQuestion === "jsbin"){
                /* questo è il caso in cui il professore permette allo studente di usare jsbin per rispondere ad una domanda ma non gli da nessun
                 * tipo di aiuto per partire */
                if(html === '' && css === '' && javascript === ''){
                    objQuestion = {
                        type: "jsbin",
                        text: text.split("\n")
                    };
                }
                else {
                    objQuestion = {
                        type: "jsbin",
                        text: text.split("\n"),
                        html: html.split("\n"),
                        css: css.split("\n"),
                        javascript: javascript.split("\n")
                    };
                }
                objJson.question = q;
                q.push(objQuestion);
            }
            /* domanda a risposta multipla */
            else if(typeQuestion === "radio"){
                var res = validateMoreChoise(divChoise);
                if(res === true) {
                    objQuestion = {
                        type: "radio",
                        text: text.split("\n"),
                        options: divChoise
                    };
                    objJson.question = q;
                    q.push(objQuestion);
                }
                else{
                    alert(res);
                }
            }
        }
        createObjJson = true;
        console.log("JSON: ", objJson);
        return objJson;
    }
}

/* Le checkbox sono o tutte nulle o tutte inizializzate, in questo modo le domande a risposta multipla avranno sempre 4 opzioni possibili */
function validateMoreChoise(divChoise){
    var countNotNull = 0;
    for (var j = 0; j < 4; j++) {
        if (divChoise[j] !== '') {
            countNotNull++;
            alert("notNull");
        }
    }
    if(countNotNull === 4){
        return true;
    }
    else{
        return "tutti i 4 campi devono essere riempiti";
    }
}

/* questa funzione prende in input i valori presenti nel file selezionato, rispettivamente dei campi: "nome della prova", "copertina per lo studente"
 * "array di domande". questi valori vengono trasferiti nei rispettivi campi di input */
function getFromFile(name, cover, question){
    var i,j;
    /* vengono creati tanti div quante sono le domande all'interno del file selezionato */
    for(i=1; i<question.length; i++){
        cloneDivQuestion();
    }

    /* se precedentemente era stato selezionato un altro file, questa funzione permette di cancellare i dati già presenti prima di caricare i nuovi */
    clearInput(question);

    document.getElementById("inputNameExam").value = name;
    for(i=0; i<cover.length; i++) {
        if(i !== cover.length -1)
            document.getElementById("inputCoverExam").value += cover[i] + "\n";
        else {
            /* se è l'ultimo elemento l'andata a capo non viene aggiunta */
            document.getElementById("inputCoverExam").value += cover[i];
        }
    }
    for(i=0; i<question.length; i++){
        var z = (i+1);
        document.getElementById("choiseTypeQuestion"+ z).value += question[i].type;
        if(question[i].type === "radio"){
            for(j=0; j<question[i].text.length; j++) {
                if (j !== question[i].text.length -1)
                    document.getElementById("inputText" + z).value += question[i].text[j] + "\n";
                else
                    document.getElementById("inputText" + z).value += question[i].text[j];
            }
            document.getElementById("choisea" + z).value += question[i].options[0];
            document.getElementById("choiseb" + z).value += question[i].options[1];
            document.getElementById("choisec" + z).value += question[i].options[2];
            document.getElementById("choised" + z).value += question[i].options[3];
        }
        else if(question[i].type === "text"){
            for(j=0; j<question[i].text.length; j++) {
                if (j !== question[i].text.length -1)
                    document.getElementById("inputText" + z).value += question[i].text[j] + "\n";
                else
                    document.getElementById("inputText" + z).value += question[i].text[j];
            }
        }
        else if(question[i].type === "jsbin") {
            for (j = 0; j < question[i].text.length; j++) {
                if (j !== question[i].text.length - 1)
                    document.getElementById("inputText" + z).value += question[i].text[j] + "\n";
                else
                    document.getElementById("inputText" + z).value += question[i].text[j];
            }
            if(question[i].hasOwnProperty('html')){
                for (j = 0; j < question[i].html.length; j++) {
                    if (j !== question[i].html.length - 1)
                        document.getElementById("inputHtml" + z).value += question[i].html[j] + "\n";
                    else
                        document.getElementById("inputHtml" + z).value += question[i].html[j];
                }
            }
            if(question[i].hasOwnProperty('css')) {
                for (j = 0; j < question[i].css.length; j++) {
                    if (j !== question[i].css.length - 1)
                        document.getElementById("inputCss" + z).value += question[i].css[j] + "\n";
                    else
                        document.getElementById("inputCss" + z).value += question[i].css[j];
                }
            }
            if(question[i].hasOwnProperty('javascript')) {
                for (j = 0; j < question[i].javascript.length; j++) {
                    if (j !== question[i].javascript.length - 1)
                        document.getElementById("inputJavascript" + z).value += question[i].javascript[j] + "\n";
                    else
                        document.getElementById("inputJavascript" + z).value += question[i].javascript[j];
                }
            }
        }
    }
}

/* questa funzione prende in input il numero di domande presenti nel file selezionato e svuota i campi di input */
function clearInput(question){
    var i;
    /* numero di div (domande) già presenti nella schermata */
    var totDiv = $('div[id^="question"]').length;
    /* se il numero di domande prensenti nel file è minore del numero di div presenti vengono cancellati i div che non sono necessari */
    if(question.length < totDiv){
        for(i=totDiv; i>question.length; i--) {
            $("#question" + i).remove();
            len--;
            count--;
        }
    }

    document.getElementById("inputNameExam").value = '';
    document.getElementById("inputCoverExam").value = '';
    for(i=0; i<question.length; i++){
        var z = i+1;
        document.getElementById("choiseTypeQuestion"+ z).value = '';
        document.getElementById("inputText" + z).value = '';
        document.getElementById("choisea" + z).value = '';
        document.getElementById("choiseb" + z).value = '';
        document.getElementById("choisec" + z).value = '';
        document.getElementById("choised" + z).value = '';
        document.getElementById("inputHtml" + z).value = '';
        document.getElementById("inputCss" + z).value = '';
        document.getElementById("inputJavascript" + z).value = '';
    }
}

function switchUpQuestion(button){
    var currentDivId = button.parent().parent().parent().attr('id');
    var sliceId = parseInt(currentDivId.slice(-1));

    var precId = sliceId - 1;
    var precDiv = document.getElementById("question"+precId);
    if(precDiv){
        /* salvo i valori della domanda corrente */
        var typeCurrent = document.getElementById("choiseTypeQuestion"+sliceId).value;
        var textCurrent = document.getElementById("inputText"+sliceId).value;
        var choiseaCurrent = document.getElementById("choisea"+sliceId).value;
        var choisebCurrent = document.getElementById("choiseb"+sliceId).value;
        var choisecCurrent = document.getElementById("choisec"+sliceId).value;
        var choisedCurrent = document.getElementById("choised"+sliceId).value;
        var htmlCurrent = document.getElementById("inputHtml"+sliceId).value;
        var cssCurrent = document.getElementById("inputCss"+sliceId).value;
        var javascriptCurrent = document.getElementById("inputJavascript"+sliceId).value;
        /* salvo i valori della domanda precendente */
        var typePrec = document.getElementById("choiseTypeQuestion"+precId).value;
        var textPrec = document.getElementById("inputText"+precId).value;
        var choiseaPrec = document.getElementById("choisea"+precId).value;
        var choisebPrec = document.getElementById("choiseb"+precId).value;
        var choisecPrec = document.getElementById("choisec"+precId).value;
        var choisedPrec = document.getElementById("choised"+precId).value;
        var htmlPrec = document.getElementById("inputHtml"+precId).value;
        var cssPrec = document.getElementById("inputCss"+precId).value;
        var javascriptPrec = document.getElementById("inputJavascript"+precId).value;

        /* la domanda corrente assume i valori di quella precedente e viceveresa */
        document.getElementById("choiseTypeQuestion"+sliceId).value = typePrec;
        document.getElementById("inputText"+sliceId).value = textPrec;
        document.getElementById("choisea"+sliceId).value = choiseaPrec;
        document.getElementById("choiseb"+sliceId).value = choisebPrec;
        document.getElementById("choisec"+sliceId).value = choisecPrec;
        document.getElementById("choised"+sliceId).value = choisedPrec;
        document.getElementById("inputHtml"+sliceId).value = htmlPrec;
        document.getElementById("inputCss"+sliceId).value = cssPrec;
        document.getElementById("inputJavascript"+sliceId).value = javascriptPrec;

        document.getElementById("choiseTypeQuestion"+precId).value = typeCurrent;
        document.getElementById("inputText"+precId).value = textCurrent;
        document.getElementById("choisea"+precId).value = choiseaCurrent;
        document.getElementById("choiseb"+precId).value = choisebCurrent;
        document.getElementById("choisec"+precId).value = choisecCurrent;
        document.getElementById("choised"+precId).value = choisedCurrent;
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
        var typeCurrent = document.getElementById("choiseTypeQuestion"+sliceId).value;
        var textCurrent = document.getElementById("inputText"+sliceId).value;
        var choiseaCurrent = document.getElementById("choisea"+sliceId).value;
        var choisebCurrent = document.getElementById("choiseb"+sliceId).value;
        var choisecCurrent = document.getElementById("choisec"+sliceId).value;
        var choisedCurrent = document.getElementById("choised"+sliceId).value;
        var htmlCurrent = document.getElementById("inputHtml"+sliceId).value;
        var cssCurrent = document.getElementById("inputCss"+sliceId).value;
        var javascriptCurrent = document.getElementById("inputJavascript"+sliceId).value;
        /* salvo i valori della domanda successiva */
        var typeSucc = document.getElementById("choiseTypeQuestion"+succId).value;
        var textSucc = document.getElementById("inputText"+succId).value;
        var choiseaSucc = document.getElementById("choisea"+succId).value;
        var choisebSucc = document.getElementById("choiseb"+succId).value;
        var choisecSucc = document.getElementById("choisec"+succId).value;
        var choisedSucc = document.getElementById("choised"+succId).value;
        var htmlSucc = document.getElementById("inputHtml"+succId).value;
        var cssSucc = document.getElementById("inputCss"+succId).value;
        var javascriptSucc = document.getElementById("inputJavascript"+succId).value;

        /* la domanda corrente assume i valori di quella successiva e viceveresa */
        document.getElementById("choiseTypeQuestion"+sliceId).value = typeSucc;
        document.getElementById("inputText"+sliceId).value = textSucc;
        document.getElementById("choisea"+sliceId).value = choiseaSucc;
        document.getElementById("choiseb"+sliceId).value = choisebSucc;
        document.getElementById("choisec"+sliceId).value = choisecSucc;
        document.getElementById("choised"+sliceId).value = choisedSucc;
        document.getElementById("inputHtml"+sliceId).value = htmlSucc;
        document.getElementById("inputCss"+sliceId).value = cssSucc;
        document.getElementById("inputJavascript"+sliceId).value = javascriptSucc;

        document.getElementById("choiseTypeQuestion"+succId).value = typeCurrent;
        document.getElementById("inputText"+succId).value = textCurrent;
        document.getElementById("choisea"+succId).value = choiseaCurrent;
        document.getElementById("choiseb"+succId).value = choisebCurrent;
        document.getElementById("choisec"+succId).value = choisecCurrent;
        document.getElementById("choised"+succId).value = choisedCurrent;
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
    element.getElementsByTagName("div")[3].id = "divChoise"+count;
    element.getElementsByTagName("div")[4].id = "html"+count;
    element.getElementsByTagName("div")[5].id = "css"+count;
    element.getElementsByTagName("div")[6].id = "javascript"+count;
    /* input */
    element.getElementsByTagName("input")[0].id = "choiseTypeQuestion"+count;
    element.getElementsByTagName("input")[1].id = "choisea"+count;
    element.getElementsByTagName("input")[2].id = "choiseb"+count;
    element.getElementsByTagName("input")[3].id = "choisec"+count;
    element.getElementsByTagName("input")[4].id = "choised"+count;
    /* textarea question */
    element.getElementsByTagName("textarea")[0].id = "inputText"+count;
    element.getElementsByTagName("textarea")[1].id = "inputHtml"+count;
    element.getElementsByTagName("textarea")[2].id = "inputCss"+count;
    element.getElementsByTagName("textarea")[3].id = "inputJavascript"+count;
    count++;
}

function getHours(){
    var today = new Date();
    var minutes = today.getMinutes();
    var hours;
    if(minutes >= 0 && minutes < 10) {
        hours = today.getHours() + ":0" + minutes;
    }
    else{
        hours = today.getHours() + ":" + minutes;
    }
    return hours;
}

function getDataItalianFormat(){
    var m_names = new Array("gennaio", "febbraio", "marzo","aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre");
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    var date = curr_date + " " + m_names[curr_month] + " " + curr_year;
    return date;
}

function updateTable(){
    $.ajax({
        url: "getDataStudent",
        dataType: "json",
        success: function (data){
            //console.log("RISULTATIIIII " + data.studentName + data.studentSurname);
            if(data.studentName !== null && data.studentSurname !== null){
                //console.log("STUDENTLOGBEFORE "+studentLog);
                var tableRow;
                if(data.newStudent === 1) {
                    studentLog++;
                    console.log("STUDENTLOG "+studentLog);
                    var $tbody = $("#tableStartExam tbody");
                    var $spanStudentLog = $("#studentLog");
                    tableRow = "<tr>";
                    tableRow += "<td><input type='checkbox'></td>";
                    tableRow += "<td>" + data.studentPost + "</td>";
                    tableRow += "<td>" + data.studentName + " " + data.studentSurname + "</td>";
                    tableRow += "</tr>";
                    $tbody.append(tableRow);
                    //console.log("STUDENTLOG "+studentLog);
                    $spanStudentLog.text(studentLog);
                }
            }
            else{
                var $tbody = $("#divStartExam tbody");
                $tbody.empty();
            }
        },
        error: function () {
            alert("Errore nella updateTable");
        }
    });
}

function updateTableFinish() {
//gestione click pulsante che ritorna tutti gli studenti che hanno terminato l'esame di oggi
    //call the service that return all student that have finish
    $.ajax({
        url: "/getFinishStudent",
        dataType: "json",
        success: function (res) {
            //console.log(res);
            if (!res.length) {
                //console.log("nessuno ha consegnato");
            } else {
                var $divExamReport = $("#divEndExam");
                //var $thead = $("#tableEndExam thead");
                var $tbody = $("#tableEndExam tbody");
                //$thead.empty();
                $tbody.empty();

                var tmp;

                var tableRow;
                for (var i = 0; i < res.length; i++) {
                    tmp = res[i];
                    tableRow = "<tr>";
                    tableRow += "<td>" + tmp[headersTableReport[3]] + "</td>";
                    tableRow += "<td>" + tmp[headersTableReport[0]] + " " + tmp[headersTableReport[1]] + "</td>";
                    tableRow += "<td>" + "Consegnata" + "</td>";
                    tableRow += "</tr>";
                    $tbody.append(tableRow);
                }
                $divExamReport.show();

            }
        },
        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function createCountdownObject(millisec){
    var second = millisec / MILLIS2SEC;
    $("#divCountdown").empty();

    var myCountdown2 = new Countdown({
        time: second,
        //style: "flip",
        width:300,
        height:80,
        inline:true,
        hideLine: true,
        onComplete: function(second){
          $("div[id^='Container_jbeeb']").css("background-color", "red");
        },
        target: "divCountdown",
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