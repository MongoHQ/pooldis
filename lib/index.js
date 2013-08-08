var Redis = require("redis"),
    Q = require("q"),
    Pool = require("generic-pool").Pool,
    URL = require("url");

var Dis = function(url, options){

  options = (options || url || {});
  options.pool = (options.pool || {});

  var args = [null, null],
      auth = null;

  // First, parse the URL.
  if (typeof url === "string") { // redis URL
    var parsedUrl = URL.parse(url);
    args = [parsedUrl.port, parsedUrl.hostname];
    auth = parsedUrl.auth && parsedUrl.auth.split(":")[1] || null;
  }

  // Override anything from the URL with what's in the options.
  args[0] = (options.port || null);
  args[1] = (options.hostname || null);
  args.push(options);
  auth = options.password || null;

  this._pool = Pool({
    name: "redis",
    create: function(callback){
      var client = Redis.createClient.apply(Redis, args)
      if (auth) {
        return client.auth(auth, function(error){
          callback(error, client);
        });
      }
      callback(null, client);
    },
    destroy: function(client) {
      client.quit()
    },
    max: options.pool.max || 10,
    min: options.pool.min || 0,
    idleTimeoutMillis: options.pool.idleTimeoutMillis || 15000
  });
};

// Get a redis client from the pool
Dis.prototype._getClient = function(callback){
  this._pool.acquire(callback);
};

// Destroy a redis client from the pool
Dis.prototype._destroyClient = function(client){
  this._pool.release(client);
};

// Apply all the available commands from the redis client
// using promises and connection pooling
for (var command in Redis.RedisClient.prototype) {
  
  Dis.prototype[command] = function(){
    var args = Array.prototype.slice.call(arguments);
    var originalCallback = args[args.length - 1];
    if (typeof originalCallback !== "function")
      originalCallback = null;

    var deferred = Q.defer();

    this._getClient(function(error, client){
    
      callback = function(){
        var cbArgs = Array.prototype.slice.call(arguments);
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
}

module.exports = Dis;