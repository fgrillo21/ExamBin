describe("Validate Exam", function() {
    describe("Javascript Rule", function() {
        it("La variabile i dovrebbe avere il valore 10", function() {
            chai.expect(window.i).to.equal(10);
        });

        it("La variabile denominata 'borghi' dovrebbe avere il valore 22", function() {
            chai.expect(window.borghi).to.equal(22);
         });
         it("La funzione z() dovrebbe ritornare il valore 3", function() {
             chai.expect(window.zeta()).to.equal(3);
         });
    });
    describe("HTML Rule", function() {
        it("Nessun elemento html dovrebbe contenere l'attributo class", function() {
            var numElementClass  = window.$("[class]").length;
            chai.expect(numElementClass).to.equal(0);
        });
        it("Nessun elemento html dovrebbe contenere l'attributo id", function() {
            var numElementId  = window.$("[id]").length;
            chai.expect(numElementId).to.equal(0);
        });
    });
});