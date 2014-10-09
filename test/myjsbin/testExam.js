/**
 * Created by Trappola on 07/10/2014.
 */
var expect = require('chai').expect;
var config = require('./testConfig');
//var cheerio = require('cheerio');

var examWindow = config.getExam();
//var $ = cheerio.load(exam.html);
//var $ = cheerio.load("<!DOCTYPE html><html><head><meta charset='utf-8'><title>JS Bin</title><style id='jsbin-css'>p {color:red;}</style></head><body><p>ATTENZIONE ATTENZIONE ATTENZIONE</p><p>Questo è il compito d'esame</p><p>Adesso anche la codifica di notepad++ è apposto SIIIIIIIII</p><p></p>j</body></html>");
//var numElementClass  = $("head").css("color");
//console.log(numElementClass);
describe("Validate Exam", function() {
    describe("Html Rule", function() {
        it("should not have element with attribute class", function() {
            //var numElementClass  = $("[class]").length;
            expect(examWindow.y).to.equal(1);
        });

        it("should not have element with attribute id", function() {
            //var numElementClass  = $("[id]").length;
            expect(examWindow.x).to.equal(3);
        });
        it("should have threee <p> element", function() {
//            var numElementClass  = $("p").css();
//            console.log(numElementClass);
            expect(examWindow.zeta()).to.equal(3);
        });
    });

    /*describe("#greets", function() {
        it("should throw if no target is passed in", function() {
            expect(function() {
                (new Cow()).greets();
            }).to.throw(Error);
        });

        it("should greet passed target", function() {
            var greetings = (new Cow("Kate")).greets("Baby");
            expect(greetings).to.equal("Kate greets Baby");
        });
    });*/
});