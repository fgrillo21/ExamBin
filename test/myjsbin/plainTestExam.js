var expect = require('chai').expect;

function mainFunction(innerWindow) {
    var window = innerWindow;
    describe("Html Rule", function() {
        it("should not have element with attribute class", function() {
            //tested++;
            //var numElementClass  = $("[class]").length;
            expect(window.i).to.equal(10);
        });

        /* it("vediamo se incluso veramente il file", function() {
         //var numElementClass  = $("[id]").length;
         tested++;
         expect(x).to.equal(3);
         });
         it("test my function zeta", function() {
         //            var numElementClass  = $("p").css();
         //            console.log(numElementClass);
         tested++;
         expect(zeta()).to.equal(3);
         });*/
    });

}

var x = {
    mainfunction: mainFunction
}

module.exports = x;