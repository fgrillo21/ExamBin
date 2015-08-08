/**
 * Created by Francesca Grillo on 16/03/2015.
 */
var express = require('express');
var studentName = null;
var studentSurname = null ;
var studentRegistrationNumber = 0;
var studentPost = null;
var newStudent = 0;
var checked = [];
var urlExamComplete = [];

function setDataStudent( newName, newSurname, newRegistrationNumber, newPost){
    studentName = newName;
    studentSurname = newSurname;
    studentRegistrationNumber = newRegistrationNumber;
    studentPost = newPost;

    var result = {
        ok: true
    };
    return result;
}

function setNewStudent(value){
    newStudent = value;
}

function getDataStudent(){
    var data = {
        'studentName' : studentName,
        'studentSurname': studentSurname,
        'studentRegistrationNumber': studentRegistrationNumber,
        'studentPost': studentPost,
        'newStudent': newStudent
    };
    return data;
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
