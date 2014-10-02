/**
 * Created by Trappola on 02/10/2014.
 */

var status = "notest";
var timeout = null;
var url = "http://localhost:7002/"; //todo set in base of the machine where I start myJsbin
var startExam = null;
var finishExam = null;
var durationTest = 60000; //in millis of course ==> adesso un minuto
var durationOverTime = 20000; //todo this value can be set by the professor
var MILLIS_TO_SET_START = 15000;
var MILLIS_TO_SET_OVERTIME = 15000;
var MILLIS_TO_SET_ALMOST_TIME = 5000;

function getClockAula(){

    var clockAula = null;

    switch (status){
        case 'notest':
        case 'setup':
        case 'overtime':
        case 'over':
        case 'almostover':
            clockAula = {
                'status' : status
            }
            break;
        case 'ready':
            clockAula = {
                'status' : status,
                'url' : url
            }
            break;
        case 'start':
            clockAula = {
                'status' : status,
                'url' : url,
                'timeout' : timeout
            }
            break;
        default :
            clockAula = {};
            break;
    }
    return clockAula;
}

function setClockAula(newStatus){
    console.log("setClockAula "+newStatus + new Date());
    var result = {
        ok: true
    }

    switch (newStatus){
        case 'notest':
        case 'setup':
        case 'over':
            status = newStatus;
            break;
        case 'ready':
            status = newStatus;
            //I try to set the status to start after 5 second from ready status
            setTimeout(function(){setClockAula('start');},MILLIS_TO_SET_START);
            break;
        case 'start':
            status = newStatus;
            //getTime() function return the number of milliseconds since 1970/01/01
            startExam = new Date().getTime(); //set the milliseconds of the start of the actual exam session
            finishExam = startExam + durationTest; //set the millisecond of the end of the actual exam session
            setTimeout(function(){setClockAula('overtime')},durationTest - MILLIS_TO_SET_OVERTIME);
            break;
        case 'overtime':
            status = newStatus;
            setTimeout(function(){setClockAula('almostover')},durationOverTime - MILLIS_TO_SET_ALMOST_TIME);
            break;
        case 'almostover':
            status = newStatus;
            setTimeout(function(){setClockAula('over')}, MILLIS_TO_SET_ALMOST_TIME);
        default :
            result = {
                ok: false
            }
            break;
    }
    return result;
}

var clockAula = {
    getClockAula : getClockAula,
    setClockAula: setClockAula
}

module.exports = clockAula;