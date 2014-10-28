/**
 * Created by Trappola on 17/10/2014.
 */

var fileValidationUploaded = false;
var voteWeightUploaded = false;
var validateExamsArray = null;

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

    loadExamsDate();

    $("#formValidationFile").submit(function(event) {
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
                    fileValidationUploaded = true;
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

    $("#formVoteWeight").submit(function(event) {
        /* stop form from submitting normally */
        event.preventDefault();

        /* get some values from elements on the page: */
        var $form = $( this ),
            url = $form.attr( 'action' );
        var formData = new FormData($(this)[0]);
        var confirmInput = validateWeightInput();

        if (confirmInput) {
            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.ok) {
                        voteWeightUploaded = true;
                        alert(response.message);
                    } else {
                        alert(response.message);
                    }
                },
                error: function () {
                    alert("Si è verificato un problema");
                }
            });
        } else {
            alert("Attenzione!!! \nInserire dei valori numerici nei campi del form");
        }
    });

    $("#btnGetExamValidation").click(function() {
        //call the service that return all

        var confirmRequest = true;

        var optionSelected = $( "#selectExamDate" ).val();
        var customValidation = $('#checkboxCustomValidation').is(':checked');
        console.log(customValidation);

        if (!fileValidationUploaded || !voteWeightUploaded || optionSelected === "---"){
            var message = "ATTENZIONE\n\n";

            if (optionSelected === "---"){
                message += "- nessuna data dell'esame selezionata\n";
                alert(message);
                confirmRequest = false;
            } else {

                if (!fileValidationUploaded) {
                    message += "- testo validazione custom non caricato\n";
                }
                if (!voteWeightUploaded) {
                    message += "- pesi per creazione voto non caricati\n";
                }
                message += "\n\nPremendo OK verrà effettuata la validazione\ncon le impostazioni di default del sistema\n";
                confirmRequest = confirm(message);
            }
        }

        var dataToSend = {
            date: optionSelected,
            useCustomValidation : customValidation
        };

        if (confirmRequest) {

            $.ajax({
                url: "/correction/validateExams",
                dataType: "json",
                data: dataToSend,
                success: function (res) {
                    console.log(res);
                    alert(res);
                    validateExamsArray = res;
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
                            if (tmp[headersTableReport[z]+"_messages"] && tmp[headersTableReport[z]+"_messages"].length){
                                tableRow += "<td class='pointer' onclick='viewErrorDialog("+i+",\""+headersTableReport[z]+"\")' >" + tmp[headersTableReport[z]] + "</td>";
                            } else {
                                tableRow += "<td>" + tmp[headersTableReport[z]] + "</td>";
                            }
                        }
                        tableRow += "</tr>";
                        $tbody.append(tableRow);
                    }
                    $divExamReport.show();
                },
                error: function () {
                    alert("Si è verificato un problema");
                }
            });
        }
    });

    $("#btnAllowCustomValidation").click(function() {
        if ($('#checkboxCustomValidation').is(':checked')){
            $('#checkboxCustomValidation').prop('checked', false);
        } else {
            $('#checkboxCustomValidation').prop('checked', true);
        }
    });

    //I put this call inside a link with target attribute with value _blank ;)
    /*$("#saveReport").click(function() {
        window.location.href = location.protocol+"//"+location.hostname+":"+location.port+"/professor/correction/file";
    });*/
}

function loadExamsDate() {
    $.ajax({
        url: "/correction/getAllExamsDate",
        dataType: "json",
        success: function (response) {
            console.log(response);
            alert(response);
            var $selectDate = $("#selectExamDate");
            var tmpOption = null;
            for (var i = 0; i < response.length; i++){
                tmpOption = "<option value='"+response[i]+"'>"+response[i]+"</option>";
                $selectDate.append(tmpOption);
            }
        },
        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function viewErrorDialog(index, errorType){
    var exam = validateExamsArray[index];
    var $modalTitle = $('#myModalErrorTitle');
    var $modalBody = $('#myModalError div.modal-body');

    $modalTitle.empty();
    $modalBody.empty();

    var errorArray = exam[errorType+"_messages"];
    $modalTitle.append(errorType.replace("_", " "));
    switch (errorType){
        case "error_Html":
        case "error_Css":
            for(var i = 0; i < errorArray.length; i++){
                $modalBody.append("<p>" + (i+1) +") " +errorArray[i]["message"]+"</p>");
            }
            break;
        case "error_Javascript":
            var stringError = null;
            //I implement this if because esprima can get an exception if the sintax is invalidable
            if (errorArray.exception){
                $modalBody.append("<p> Eccezione nella validazione: " + errorArray.error + "</p>");
            } else {
                for (var i = 0; i < errorArray.length; i++) {
                    stringError = "error at line " + errorArray[i]["lineNumber"] + " : " + errorArray[i]["description"];
                    $modalBody.append("<p>" + (i+1) +") "+stringError + "</p>");
                }
            }
            break;
        case "pass_Mocha":
        case "failure_Mocha":
            for(var i = 0; i < errorArray.length; i++){
                $modalBody.append("<p>" + (i+1) +") "+ errorArray[i]+"</p>");
            }
            break;
    }
    $('#myModalError').modal('show');
}

function validateInputFile(){

    var ok = false;

    //I want a js file for custom validation
    if ($("#fileMochaUpload").val().split('.').pop() === "js"){
        ok = true;
    }
    return ok;
}

function validateWeightInput(){

    var ok = false;
    var whtml = $("#inputWeightHtml").val();
    var wcss = $("#inputWeightCss").val();
    var wjs = $("#inputWeightJavascript").val();
    var wcustom = $("#inputWeightMocha").val();
    var startVote = $("#inputStartVote").val();
    if (whtml !== "" && whtml > 0 ){
        if (wcss !== "" && wcss > 0){
            if (wjs !== "" && wjs > 0){
                if (wcustom !== "" && wcustom > 0){
                    if (startVote !== "" && startVote > 0){
                        ok = true;
                    }
                }
            }
        }
    }
    return ok;
}