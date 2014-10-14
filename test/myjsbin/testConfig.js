/**
 * Created by Trappola on 07/10/2014.
 */
var exams = [];

function getExams(){
    return exams;
}

function addExam(examToTest){
    exams.push(examToTest);
}

var testConfig = {
    getExams: getExams,
    addExam: addExam
};

module.exports = testConfig;