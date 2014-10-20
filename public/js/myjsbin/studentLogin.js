/**
 * Created by Trappola on 02/10/2014.
 */
$(document).ready(mainFunction);

var clockStatus = null;
var timeout = 3000 + Math.floor(Math.random()*2000); //set the timeout for make the ajax request for the state of the classroom clock;

function mainFunction() {

    callForClockAulaStatus();

    /*$("#formLogin").submit(function(event) {
        *//* stop form from submitting normally *//*
        event.preventDefault();

        *//* get some values from elements on the page: *//*
        var $form = $( this ),
            url = $form.attr( 'action' );
        var formData = new FormData($(this)[0]);
        console.log(formData);
        var confirmInput = true;

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
    });*/

    cookieJsbin = getCookie("jsbin");
    console.log(cookieJsbin);
}

function callForClockAulaStatus() {

    $.ajax({
        url: "getClockAula", //this is the right route
        dataType: "json",
        success: function (data) { //TODO here I need a switch block to manage different clock status
            console.log(data);
            if (data.status !== clockStatus){
                clockStatus = data.status;
                switch (clockStatus){
                    case "notest":
                    case "almostover":
                    case "overtime":
                    case "over":
                        $('#btnLogin').prop('disabled', true);
                        break;
                    case "setup":
                    case "ready":
                    case "start":
                        $('#btnLogin').prop('disabled', false);
                        break;
                }
            }
            var cookie = document.cookie;
            console.log(cookie);
            setTimeout(callForClockAulaStatus, timeout);
        },

        error: function () {
            alert("Si è verificato un problema");
        }
    });
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}