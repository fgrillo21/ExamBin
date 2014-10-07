/**
 * Created by Trappola on 07/10/2014.
 */
var exam = null;

function getExam(){
    return exam;
}

function setExam(examToTest){
    exam = examToTest;
}

var testConfig = {
    getExam: getExam,
    setExam: setExam
};

module.exports = testConfig;