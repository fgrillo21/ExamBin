/**
 * Created by Trappola on 13/10/2014.
 */
var expect = require('chai').expect;

function mainTest() {
    it("should not have element with attribute class", function() {
        //var numElementClass  = window.$("[class]").length;
        expect(window.i).to.equal(10);
    });
}

function create(Examwindow){

    var funzione = function(){
        var tmp = examWindow;
        it("should not have element with attribute class", function() {
            //var numElementClass  = window.$("[class]").length;
            expect(tmp.i).to.equal(10);
        });
    };

    return funzione;
}

var x = {
    //mainTest: mainTest(),
    create: create
}
module.exports = x;