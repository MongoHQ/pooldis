var Dis = require("../lib"),
    assert = require("assert"),
    sinon = require("sinon");

describe("Dis", function(){
  describe("instantiation", function(){
    it("without arguments uses default settings", function(){
      var dis = new Dis
      assert(dis instanceof Dis)
    });
  });
});