/**
 * Created by Trappola on 02/10/2014.
 */
var express = require('express');
var questionP = 0;
var questionT = 0;
var click = 1;
var totQuestion = 0;
var questionSetting = false;

function setQuestionNumber( newQuestionP, newQuestionT){
    questionP = newQuestionP;
    questionT = newQuestionT;
    questionSetting = true;

    var result = {
        ok: true
    };
    return result;
}

function getQuestionNumber(){
    var question = {
        numQuestionP : questionP,
        numQuestionT: questionT
    };
    return question;
}

function setClick(newValueClick){
    click = newValueClick;
}

function getClick(){
    return click;
}

function getTotQuestion(){
    return parseInt(questionP) + parseInt(questionT);
}

var numberQ = {
    setQuestionNumber : setQuestionNumber,
    getQuestionNumber: getQuestionNumber,
    getTotQuestion : getTotQuestion,
    setClick: setClick,
    getClick : getClick
};

module.exports = numberQ;