/**
 * Created by Francesca Grillo on 16/03/2015.
 */
var express = require('express');
var urlExamComplete = [];
var dataStudent = [];
var questionJsbinChecked;
var urlFileStudent;

function setJsbinChecked(newChecked){
    questionJsbinChecked = newChecked;
}

function getJsbinChecked(){
    return questionJsbinChecked;
}

function setUrlFileStudent(url){
    urlFileStudent = url;
}

function getUrlFileStudent(){
    return urlFileStudent;
}

function setDataStudent( newName, newSurname, newRegistrationNumber, newPost){
    var data = {
        'studentName' : newName,
        'studentSurname': newSurname,
        'studentRegistrationNumber': newRegistrationNumber,
        'studentPost': newPost
    };
    dataStudent.push(data);

    var result = {
        ok: true
    };
    return result;
}

function getDataStudent(){
    return dataStudent.pop();
}

function setUrlExamComplete(url){
    var dataToSend = {};
    var urlArray = url.split("_");
    dataToSend.name = urlArray[2];
    dataToSend.surname = urlArray[3];
    dataToSend.registrationNumber = urlArray[4];
    dataToSend.post = urlArray[5];
    urlExamComplete.push(dataToSend);
}

function getUrlExamComplete(){
    return urlExamComplete;
}

var studentData = {
    setDataStudent: setDataStudent,
    getDataStudent: getDataStudent,
    setUrlExamComplete: setUrlExamComplete,
    getUrlExamComplete: getUrlExamComplete,
    setJsbinChecked: setJsbinChecked,
    getJsbinChecked: getJsbinChecked,
    setUrlFileStudent: setUrlFileStudent,
    getUrlFileStudent: getUrlFileStudent
};

module.exports = studentData;
