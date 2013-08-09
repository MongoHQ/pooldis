var Pooldis = require("../lib"),
    assert = require("chai").assert,
    sinon = require("sinon");

describe("Pooldis", function(){
  describe("instantiation", function(){
    var redis;
    before(function(){
      redis = new Pooldis();
    });
    it("instantiates a client without a host", function(){
      assert.equal(redis.connectArgs[1], null);
    })
    it("instantiates a client without a port", function(){
      assert.equal(redis.connectArgs[0], null);
    })
    describe("with a valid redis URL", function(){
      describe("without a port", function(){
        var redis;
        before(function(){
          redis = new Pooldis("redis://127.0.0.1");
        });
        it("instantiates a client with the right host", function(){
          assert.equal(redis.connectArgs[1], "127.0.0.1");
        })
        it("instantiates a client with the right port", function(){
          assert.equal(redis.connectArgs[0], 6379);
        })
      })
      describe("with a port", function(){
        var redis;
        before(function(){
          redis = new Pooldis("redis://127.0.0.1:6379");
        });
        it("instantiates a client with the right host", function(){
          assert.equal(redis.connectArgs[1], "127.0.0.1");
        })
        it("instantiates a client with the right port", function(){
          assert.equal(redis.connectArgs[0], 6379);
        })
      })
    });
    describe("with an options object", function(){
      var redis;
      before(function(){
        redis = new Pooldis({hostname: "127.0.0.1", port: 6379});
      });
      it("instantiates a client with the right host", function(){
        assert.equal(redis.connectArgs[1], "127.0.0.1");
      })
      it("instantiates a client with the right port", function(){
        assert.equal(redis.connectArgs[0], 6379);
      })
    });
  });
});