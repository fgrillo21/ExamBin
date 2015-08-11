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
        'studentPost': newPost,
        'newStudent': newStudent
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
    urlExamComplete.push(url);
}

function getUrlExamComplete(){
    return urlExamComplete.pop();
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
