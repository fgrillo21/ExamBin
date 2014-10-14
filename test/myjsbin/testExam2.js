/**
 * Created by Trappola on 13/10/2014.
 */
/**
 * Created by Trappola on 07/10/2014.
 */
var expect = require('chai').expect;
var config = require('./testConfig2');

var windows = config.getExam();
console.log("sono all'interno del testttttttTTTTTT");

describe("Validate Exam", function() {
    describe("Html Rule", function() {
        it("should not have element with attribute class", function() {
            //var numElementClass  = $("[class]").length;
            expect(windows.i).to.equal(10);
        });

        /*it("vediamo se incluso veramente il file", function() {
            //var numElementClass  = $("[id]").length;
            expect(windows.borghi).to.equal(22);
        });
        it("test my function zeta", function() {
//            var numElementClass  = $("p").css();
//            console.log(numElementClass);
            expect(windows.zeta()).to.equal(3);
        });*/
    });
});