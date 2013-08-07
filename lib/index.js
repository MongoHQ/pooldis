var Redis = require("redis"),
    Q = require("q"),
    Pool = require("generic-pool").Pool,
    URL = require("url"),
    commands = require("../node_modules/redis/lib/commands");

var Dis = function(options){

  options = (options || {});

  var auth = null,
      args = [null, null, options];

  if (typeof options === "string") { // redis URL
    var parsedUrl = URL.parse(options);
    args = [parsedUrl.port, parsedUrl.hostname];

    if (parsedUrl.auth)
      auth = parsedUrl.auth.split(":")[1];

  } else {
    if (options.port)
      args[0] = options.port;
    if (options.host)
      args[1] = options.host;
    if (options.password)
      auth = options.password;
  }

  this._pool = Pool({
    name: "redis",
    create: function(callback){
      var client = Redis.createClient.apply(Redis, args)
      if (auth)
        client.auth(auth)
      callback(null, client)
    },
    destroy: function(client) { client.quit() },
    max: options.maxConnections || 10,
    min: options.minConnections || 0,
    idleTimeoutMillis: options.idleTimeoutMillis || 15000
  });
};

Dis.prototype._getClient = function(callback){
  this._pool.acquire(callback);
};

commands.forEach(function(command){
  Dis.prototype[command] = function(){
    var args = Array.prototype.slice.call(arguments);
    var callback = args[args.length - 1];
    if (typeof callback !== "function")
      callback = null;

    var deferred = Q.defer();

    this._getClient(function(error, client){
      if (!callback) {
        callback = function(){
          if (arguments[0] instanceof Error)
            deferred.reject(arguments[0]);
          else
            deferred.resolve(arguments[1]);
          if (client)
            this._pool.release(client)
        }.bind(this);
        args.push(callback);
      }

      if (error) return callback(error);
      client[command].apply(client, args);
    }.bind(this));

    return deferred.promise;
  };
});

module.exports = Dis;