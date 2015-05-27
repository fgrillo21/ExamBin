$(document).ready(mainFunction);
var examUrl = null;
var clockStatus = null;
var timeout;
var MILLIS2SEC = 1000;

function mainFunction() {
    callForClockAulaStatus();
    loadQuestion();

    $(document).on('click','a[id^="link"]', function(){
        var id = $(this).attr("id");
        loadValueToJsbin(id.slice(-1));
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
                console.log("list "+data.status);
                clockStatus = data.status;
                switch (clockStatus){
                    case "start":
                        timeout = data.timeout;
                        createCountdownElement(timeout);
                        examUrl = data.url;
                        /*console.log("START "+data.url);
                        window.location.href = examUrl;*/
                        break;
                }
            }
            //setTimeout(callForClockAulaStatus, 5000);
        },

        error: function () {
            alert("Si è verificato un problema");
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
            alert("Si è verificato un problema");
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
        var para = document.createElement("P");                          // Create a <p> node
        var number =  document.createTextNode(z);
        para.appendChild(number);
        for (j = 0; j < question[i].text.length; j++) {
            var t = document.createTextNode(question[i].text[j] + "\n");        // Create a text node
            para.appendChild(t);                                        // Append the text to <p>
            var newLine = document.createElement('br');
            para.appendChild(newLine);
        }
        if(question[i].type === "text"){
            textarea = document.createElement("textarea");
            textarea.setAttribute("id", "textarea"+x);
            para.appendChild(textarea);
        }
        else if(question[i].type === "radio") {
            for (var k = 0; k < 4; k++) {
                var textChoise = document.createTextNode(question[i].options[k] + "\n");
                input = document.createElement("input");
                label = document.createElement("label");
                input.setAttribute("type", "radio");
                input.setAttribute("id", "choisea" + k+1);
                input.setAttribute("value", question[i].options[k]);
                label.appendChild(textChoise);
                para.appendChild(input);
                para.appendChild(label);
                para.appendChild(document.createElement("br"));
            }
        }
        else{
            link = document.createElement("a");
            link.setAttribute("href", examUrl);
            link.setAttribute("target", "_black");
            link.setAttribute("id", "link"+x);
            v = document.createTextNode("JSBIN");
            link.appendChild(v);
            para.appendChild(link);
        }
        para.setAttribute("class", "question");                         // Add class to node p
        document.getElementById("divQuestion").appendChild(para);        // Append node p to div*/
    }
}