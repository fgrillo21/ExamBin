$(document).ready(mainFunction);
var examUrl = null;
var clockStatus = null;
var countdownTime = 0;
var timeout;
var MILLIS2SEC = 1000;
var radio = 0;
var w = 1;
var idQuestion = 1;


function mainFunction() {
    callForClockAulaStatus();
    loadQuestion();

    $("#btnFinish").click(function() {
        var confirmDelivery = confirm("ATTENZIONE!!!\n Sei sicuro di voler consegnare il tuo esame???\n Cliccando su OK consegnerai il tuo elaborato definitivamente,\ne questa sarà la versione che verrà corretta");
        if (confirmDelivery){
            deliveryExam();
        }
    });

    $("#btnNotFinish").click(function() {
        var confirmDelivery = confirm("ATTENZIONE!!!\n Sei sicuro di voler non consegnare il tuo esame???\n Cliccando su OK confermerai la tua scelta");
        if (confirmDelivery){
            notDeliveryExam();
        }
    });

    $(document).on('click','a[id^="link"]', function(){
        var id = $(this).attr("id");
        loadValueToJsbin(id.slice(-1));
    });

    /* Ad ogni click viene salvato il valore del campo radio spuntato */
    $(document).on('click','input[id^="choise"]', function(){
        var id = $(this).attr("id");
        var value = document.getElementById(id).value;
        storeIdJsbinChecked(id, value);
    });
}

function createCountdownElement(millisec){
    var second = millisec / MILLIS2SEC;
    $("#divCountdown").empty();
    myCountdown = new Countdown({
        time: second,
        width:200,
        height:25,
        inline:true,
        hideLabels	: true,
        target: "Countdown",
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

function callForClockAulaStatus() {

    $.ajax({
        url: "getClockAula",
        dataType: "json",
        success: function (data) {
            console.log("dati arrivati");
            if (data.status !== clockStatus){
                clockStatus = data.status;
                console.log("STATUS SERVER "+clockStatus);
                switch (clockStatus){
                    case "overtime":
                        countdownTime = data.durationOverTime;
                        createCountdownObject(countdownTime);
                        break;
                    case "start":
                        timeout = data.timeout;
                        createCountdownElement(timeout);
                        examUrl = data.url;
                        break;
                    case "over":
                        deliveryExam();
                        break;
                }
            }
            setTimeout(callForClockAulaStatus, 5000);
        },

        error: function () {
            alert("Si è verificato un problema (call)");
        }
    });
}

function loadQuestion(){
    $.ajax({
        url: "loadQuestion",
        dataType: "json",
        type: "POST",
        success: function (data) {
            var res = JSON.parse(data.content);
            add(res.question);
        },

        error: function () {
            alert("Si è verificato un problema (load)");
        }
    });
}

function loadValueToJsbin(id){
    $.ajax({
        url: "loadValueToJsbin",
        dataType: "json",
        data: {id:id},
        type: "POST",
        success: function (data){
            //alert(data);
        },

        error: function () {
            alert("Si è verificato un problema load to Jsbin");
        }
    });
}

function add(question){
    var i, j, link,textarea, input,label, v;
    for(i=0; i<question.length; i++) {
        var z = (i+1) + ". ";
        var x = i+1;
        var div = document.createElement("div");
        var para = document.createElement("P");                          // Create a <p> node
        var number =  document.createTextNode(z);
        para.appendChild(number);
        for (j = 0; j < question[i].text.length; j++) {
            var t = document.createTextNode(question[i].text[j] + "\n");        // Create a text node
            para.appendChild(t);                                        // Append the text to <p>
            var newLine = document.createElement('br');
            para.appendChild(newLine);
        }
        /* domanda a risposta aperta */
        if(question[i].type === "text"){
            textarea = document.createElement("textarea");
            textarea.setAttribute("id", "textarea"+x);
            textarea.setAttribute("onchange","change(this.id)");
            para.appendChild(textarea);
        }
        /* domanda a risposta multipla */
        else if(question[i].type === "radio") {
            radio++;
            var arr = [];
            /* salvo le quattro opzioni in un array */
            for (var y = 0; y < 4; y++){
                arr.push(question[i].options[y]);
            }
            /* inserisco randomicamente le 4 opzioni eliminando ogni volta quella inserita per evitare che si ripeta */
            for (var k = 0; k < 4; k++) {
                var rand = Math.round((arr.length-1)*Math.random());
                var textChoise = document.createTextNode(arr[rand] + "\n");
                input = document.createElement("input");
                label = document.createElement("label");
                input.setAttribute("type", "radio");
                input.setAttribute("id", "choise"+ x + (k+1));
                input.setAttribute("name", "opt" + x);
                input.setAttribute("value", arr[rand]);
                label.appendChild(textChoise);
                para.appendChild(input);
                para.appendChild(label);
                para.appendChild(document.createElement("br"));
                arr.splice(rand, 1);
            }
        }
        /* jsbin */
        else{
            var id = "link" + x;
            link = document.createElement("a");
            link.setAttribute("href", examUrl);
            link.setAttribute("target", "_black");
            link.setAttribute("id", id);
            v = document.createTextNode("JSBIN");
            link.appendChild(v);
            para.appendChild(link);
        }
        para.setAttribute("class", "question");                         // Add class to node p
        para.setAttribute("id", idQuestion);                                // Add id to node p
        div.appendChild(para);
        document.getElementById("divQuestion").appendChild(div);        // Append node p to div*/
        idQuestion++;
    }
}

function storeIdJsbinChecked(id, value){
    var data = {
        id: id,
        value: value
    };
    $.ajax({
        url: "saveRadioChecked",
        data: data,
        dataType: "json",
        type: "POST",
        success: function (response) {
            console.log("RESPONSE " +response);
        },

        error: function () {
            alert("Si è verificato un problema (json file)");
        }
    });
}


function deliveryExam(){
    var urlExam = location.pathname.split('/')[1];
        urlExam += "_delivery";
    //console.log("URLDELIVERYEXAM "+urlExam);
    var examRevision = 1;

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
            window.location.href = response.finishPageUrl;
        },

        error: function () {
            alert("Si è verificato un problema (delivery exam)");
        }
    });
}

function notDeliveryExam(){
    var urlExam = location.pathname.split('/')[1];
        urlExam += "_notdelivery";
    var examRevision = 1;

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
            window.location.href = response.finishPageUrl;
        },

        error: function () {
            alert("Si è verificato un problema (not delivery exam)");
        }
    });
}

function change(id){
    var value = document.getElementById(id).value;
    var data = {
        answer: value,
        id: id
    };
    console.log("value "+value);
    $.ajax({
        url: "saveValueTextarea",
        data: data,
        dataType: "json",
        type: "POST",
        success: function (response) {
            console.log("RESPONSE " +response);
        },

        error: function () {
            alert("Si è verificato un problema (textarea)");
        }
    });
}