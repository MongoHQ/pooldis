var Dis = require("../lib"),
    assert = require("assert"),
    sinon = require("sinon");

describe("Dis", function(){
  describe("instantiation", function(){
    describe("without arguments", function(){
      var dis;
      before(function(){
        dis = new Dis()
      });
      it("uses default settings", function(){
        assert(dis instanceof Dis)
      });
    });
  });
});