/**
 * Created by Trappola on 29/09/2014.
 */
$(document).ready(mainFunction);

function mainFunction() {
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