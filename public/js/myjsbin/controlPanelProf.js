/**
 * Created by Trappola on 29/09/2014.
 */

var headersTableReport = [
    "name",
    "surname",
    "matricola",
    "html",
    "javascript",
    "css",
    "error_Html",
    "error_Javascript",
    "error_Css",
    "failure_Mocha",
    "pass_Mocha"
];

console.log($("section").length);

$(document).ready(mainFunction);

function mainFunction() {

    $("#formExamFile").submit(function(event) {

        /* stop form from submitting normally */
        event.preventDefault();

        /* get some values from elements on the page: */
        var $form = $( this ),
            url = $form.attr( 'action' );
        var formData = new FormData($(this)[0]);

//        awesome, with this ajax call I update the exam's file choose by the professor
        $.ajax({
            url: url,
            data: formData,
            type: 'POST',
            cache: false,
            contentType: false,
            processData: false,
            success: function (res) {
                console.log(res);
            },
            error: function () {
                alert("Si è verificato un problema");
            }
        })
    });

    var myCountdown2 = new Countdown({
        time: 100,
        //style: "flip",
        width:300,
        height:80,
        inline:true,
        hideLine: true,
        target: "foo", //TODO perfetc, with this property I can set the father element where attach th countdown element, created from library
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

    setTimeout(callForClockAulaStatus, 5000);

    $("button[id^='btnClock']").click(function (){
        setClockAulaStatus(this.value);
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
                var row;
                for (var i = 0; i < res.length;i++){
                    tmp = res[i];
                    tableRow = "<tr>";

                    for (var z = 0; z < headersTableReport.length ;z++){
                        tableRow += "<td>"+  htmlEntities(tmp[headersTableReport[z]])+"</td>";
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
            $("#spanStatusClock").text(data.status);
            //setTimeout(callForClockAulaStatus, 5000);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function setClockAulaStatus(newStatus) {

    var data = {
        status: newStatus
    }

    $.ajax({
        url: "setClockAula", //this is the right route
        dataType: "json",
        type: "POST",
        data: data,
        success: function (response) { //TODO here I need a switch block to manage different clock status
            console.log(response);
            $("#spanStatusClock").text(response.status);
            //setTimeout(callForClockAulaStatus, 3000);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}