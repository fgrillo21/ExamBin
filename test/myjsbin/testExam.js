/**
 * Created by Trappola on 07/10/2014.
 */
var expect = require('chai').expect;
var config = require('./testConfig');
var plainText = require('./plainTestExam');


var windows = config.getExams();
console.log("sono all'interno del testttttttTTTTTT");

for (var i = 0; i < windows.length; i++){

    var window = windows[i];
    console.log(window.i);

    //var x = plainText.create(window);

    /*describe(function(){

        it("should not have element with attribute class", function() {
            //var numElementClass  = window.$("[class]").length;
            expect(tmp.i).to.equal(10);
        });
    });*/
    (function(innerWindow) {
        describe("Validate Exam", function(){
            plainText.mainfunction(innerWindow);
        });
    })(window);
}