var Pooldis = require("../lib"),
    assert = require("assert"),
    sinon = require("sinon");

describe("Pooldis", function(){
  describe("instantiation", function(){
    it("without arguments uses default settings", function(){
      var redis = new Pooldis
      assert(redis instanceof Pooldis)
    });
  });
});