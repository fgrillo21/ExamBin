/**
 * Created by Francesca Grillo on 16/03/2015.
 */
var express = require('express');
var studentName = "null";
var studentSurname = "null";
var studentRegistrationNumber = "null";
var studentPost = "null";
var newStudent = 0;

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

var studentData = {
    setDataStudent: setDataStudent,
    setNewStudent: setNewStudent,
    getDataStudent: getDataStudent
};

module.exports = studentData;
