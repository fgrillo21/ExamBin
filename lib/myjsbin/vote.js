/**
 * Created by Trappola on 17/10/2014.
 */

//weight of single validation (with default value)
var weightStandardHtml = 0.5;
var weightStandardCss = 0.5;
var weightStandardJavascript = 0.5;
var weightMochaFailure = 1;
var startVote = 30;

function makeVote(record, useValidationCustom){

    var vote = startVote;
    vote -= record.error_Html * weightStandardHtml;
    vote -= record.error_Css * weightStandardCss;
    vote -= record.error_Javascript * weightStandardJavascript;
    if (useValidationCustom) {
        vote -= record.failure_Mocha * weightMochaFailure;
    }

    return vote;

}

function setVoteWeight(whtml, wcss, wjs, wmocha, startvote){
    weightStandardHtml = whtml;
    weightStandardCss = wcss;
    weightStandardJavascript = wjs;
    weightMochaFailure = wmocha;
    startVote = startvote;
}

function getVoteWeight(){
    var voteWeight = {
        weightStandardHtml : weightStandardHtml,
        weightStandardCss : weightStandardCss,
        weightStandardJavascript : weightStandardJavascript,
        weightMochaFailure : weightMochaFailure,
        startVote : startVote
    };

    return voteWeight;
}

var moduleVote = {
    makeVote : makeVote,
    setVoteWeight: setVoteWeight,
    getVoteWeight: getVoteWeight
};

module.exports = moduleVote;