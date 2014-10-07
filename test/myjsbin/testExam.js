/**
 * Created by Trappola on 07/10/2014.
 */
var expect = require('chai').expect;
var config = require('./testConfig');
var cheerio = require('cheerio');

var exam = config.getExam();
var $ = cheerio.load(exam.html);

describe("Validate Exam", function() {
    describe("Html Rule", function() {
        it("should not have element with attribute class", function() {
            var numElementClass  = $("[class]").length;
            expect(numElementClass).to.equal(0);
        });

        it("should not have element with attribute id", function() {
            var numElementClass  = $("[id]").length;
            expect(numElementClass).to.equal(0);
        });
        /*it("should have threee <p> element", function() {
            var numElementClass  = $("p").length;
            expect(numElementClass).to.equal(0);
        });*/
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