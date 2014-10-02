/**
 * Created by Trappola on 29/09/2014.
 */
$(document).ready(mainFunction);

function mainFunction() {

    setTimeout(callForClockAulaStatus, 5000);

    $("button[id^='btn']").click(function (){
        setClockAulaStatus(this.value);
    })

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
                for (tmp in res[0]){
                    tableHeader += "<th>"+tmp+"</th>";
                }
                tableHeader += "</tr>";
                $thead.append(tableHeader);

                var tableRow;
                var row;
                for (var i = 0; i < res.length;i++){
                    tmp = res[i];
                    tableRow = "<tr>";

                    for (row in tmp){
                        tableRow += "<td>"+  htmlEntities(tmp[row])+"</td>";
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