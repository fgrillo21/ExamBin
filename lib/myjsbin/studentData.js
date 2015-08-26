/**
 * Created by Francesca Grillo on 16/03/2015.
 */
var express = require('express');
var newStudent = 0;
var checked = [];
var urlExamComplete = [];
var dataStudent = [];

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

function setNewStudent(value){
    newStudent = value;
}

function getDataStudent(){
    return dataStudent.pop();
}

function setIdJsbinChecked(idElementChecked){
    checked.push(idElementChecked);
}

function getIdJsbinChecked(){
    return checked;
}

function removeIdJsbinChecked(idElementToRemove){
    checked.splice(idElementToRemove, 1);
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
    setNewStudent: setNewStudent,
    getDataStudent: getDataStudent,
    getIdJsbinChecked: getIdJsbinChecked,
    setIdJsbinChecked: setIdJsbinChecked,
    removeIdJsbinChecked: removeIdJsbinChecked,
    setUrlExamComplete: setUrlExamComplete,
    getUrlExamComplete: getUrlExamComplete
};

module.exports = studentData;
