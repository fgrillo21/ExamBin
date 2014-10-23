/**
 * Created by Trappola on 02/10/2014.
 */
var express = require('express');
var fileUploaded = false;
var timerSetting = false;
var status = "notest";
var timeout = 6000; //number of millisecond at the and of the exam
var url = null; // set in base of the machine where I start myJsbin
var startExam = null;
var finishExam = null;
var durationTest = 60000; //in millis of course ==> adesso un minuto (sixty second)
var durationOverTime = 15000;
var MILLIS_TO_SET_START = 5000;
var MILLIS_TO_SET_OVERTIME = 15000; //when missing 15 second to official end of the test
var MILLIS_TO_SET_ALMOST_TIME = 5000; //when missing 5 second to end of the overtime states

var MILLIS2SECOND = 1000;

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
    };

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
            timeout = durationTest;
            setTimeout(updateTimeoutAutomatically,1000);
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

function updateTimeoutAutomatically(){
    if (timeout <= 1000 && timeout > 0){
        timeout = 0;
    } else {
        timeout = timeout - 1000;
        setTimeout(updateTimeoutAutomatically,1000);
    }
}

function setDataClockAula( newDurationTest, newDurationOverTime){
    durationTest = newDurationTest;
    durationOverTime = newDurationOverTime;
    //because overtime start 15 second before the official end of the exam, so I need to add this time to its whole duration
    durationOverTime += MILLIS_TO_SET_OVERTIME;
    timerSetting = true;

    var result = {
        ok: true
    };
    return result;
}

function setFileUploadVariable( value){
    fileUploaded = true;
}

function getTimeoutInSecond(){
    return timeout/MILLIS2SECOND;
}

function setExamUrl(newExamUrl){
    url = newExamUrl;
}

var clockAula = {
    getClockAula : getClockAula,
    setClockAula: setClockAula,
    getTimeoutInSecond: getTimeoutInSecond,
    setFileUploadVariable: setFileUploadVariable,
    setDataClockAula: setDataClockAula,
    setExamUrl: setExamUrl
}

module.exports = clockAula;