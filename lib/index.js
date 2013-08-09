var Redis = require("redis"),
    Q = require("q"),
    Pool = require("generic-pool").Pool,
    URL = require("url"),
    debug = require("debug")("pooldis");

var Pooldis = function(url, options){
  options = (options || {});

  var args = [null, null],
      auth = null;

  // First, parse the URL.
  if (typeof url === "string") { // redis URL
    debug("instantion with url: %s", url);
    var parsedUrl = URL.parse(url);
    args = [parsedUrl.port, parsedUrl.hostname];
    auth = parsedUrl.auth && parsedUrl.auth.split(":")[1] || null;
  } else {
    options = url;
  }
  options.pool = (options.pool || {});

  // Override anything from the URL with what's in the options.
  args[0] = (options.port || args[0] || null);
  args[1] = (options.hostname || args[1] || null);
  args.push(options);
  auth = options.password || auth || null;

  debug("instantation with args: %s", JSON.stringify(args));
  debug("auth? %s", !!auth);

  this._pool = Pool({
    name: "redis",
    create: function(callback){
      debug("acquiring pool connection");
      var client = Redis.createClient.apply(Redis, args)
      if (auth) {
        debug("authenticating client");
        return client.auth(auth, function(error){
          debug("acquired connection");
          callback(error, client);
        });
      }
      process.nextTick(function(){
        debug("acquired connection");
        callback(null, client);
      });
    },
    destroy: function(client) {
      debug("destroying client");
      client.quit()
    },
    max: options.pool.max || 10,
    min: options.pool.min || 0,
    idleTimeoutMillis: options.pool.idleTimeoutMillis || 15000
  });
};

// Get a redis client from the pool
Pooldis.prototype._getClient = function(callback){
  this._pool.acquire(callback);
};

// Destroy a redis client from the pool
Pooldis.prototype._destroyClient = function(client){
  this._pool.release(client);
};

// Apply all the available commands from the redis client
// using promises and connection pooling
Object.keys(Redis.RedisClient.prototype).forEach(function(command){

  Pooldis.prototype[command] = function(){
    var args = Array.prototype.slice.call(arguments);
    debug("%s: %s", command.toUpperCase(), JSON.stringify(args));
    var originalCallback = args[args.length - 1];
    if (typeof originalCallback !== "function")
      originalCallback = null;

    var deferred = Q.defer();

    this._getClient(function(error, client){
    
      callback = function(){
        var cbArgs = Array.prototype.slice.call(arguments);
        debug("%s response: %s", command.toUpperCase(), JSON.stringify(cbArgs))
        if (originalCallback)
          originalCallback.apply(this, cbArgs);
        if (cbArgs[0] instanceof Error)
          deferred.reject(cbArgs[0]);
        else
          deferred.resolve.apply(this, cbArgs.slice(1));

        this._destroyClient(client);
      }.bind(this);

      if (originalCallback)
        args[args.length - 1] = callback
      else
        args.push(callback);

      if (error)
        deferred.reject(error);
        return callback(error);

      client[command].apply(client, args);
    }.bind(this));

    return deferred.promise;
  };

});

module.exports = Pooldis;