var commands   = require('./commands')
  , Connection = require('./connection')
  , Pool       = require('generic-pool').Pool
  , Q          = require('q')
  , _          = require('underscore')

/**
 * Pooldis requires a dial function to create new redis connections
 * on the fly. This is abstract enough to give extra flexibilty to
 * how connections are established (think redis+ssl), and allows the
 * driver to spin up new connections as needed for the dynamic pool.
 * @constructor
 * @param {fn : => valueOrPromise[stream.Duplex]} dial - function to call when aquiring a new connection
 * @param {hash} options
 *   init: {fn(connection, done)} - (optional) function to complete as part of creating a new connection (auth, select, etc...)
 */
function Pooldis(dial, options) {
  var self = this
  this._dial = dial

  options = options || {}
  this._init = options.init || function(conn, done) { done() }

  this._attach_commands()
}

Pooldis.prototype._attach_commands = function() {
  var self = this
  commands.forEach(function(command) {
    self[command.method] = self._interpret(command)
  })
}

Pooldis.prototype._interpret = function(command) {
  return function() {
    console.log('running command', command)
  }
}

Pooldis.prototype._conn = function() {
  var deferred = Q.defer()
    , self = this

  Q.when(this._dial(), function(socket) {
    var conn = new Connection(socket)
    self._init(conn, function(err) {
      if (err) {
        return deferred.reject(err)
      }
      deferred.resolve(conn)
    })
  }, function (err) {
    deferred.reject(err)
  })

  return deferred.promise
}

Pooldis.prototype._pooled = function() {

}

Pooldis.prototype._subscriber = function() {

}

Pooldis.prototype._pipelined = function() {

}

var dial = function() {
  console.log('dialing')
  var deferred = Q.defer()

  var net = require('net')
  var s = net.createConnection(6379, function() {
    console.log('resolved')
    deferred.resolve(s)
  })

  return deferred.promise
}
var init = function(conn, done) {
  conn.send('DEL', 'test')
  .then(conn.send('SET', 'test', 'val'))
  .then(function() {
    done()
  }, function(err) {
    console.log('ERRRR')
    done(err)
  })
}
var pooldis = new Pooldis(dial, {init: init})
pooldis.set('test', 'lulz')
pooldis._conn().then(function(conn) {
  conn.send('GET', 'test').then(function(value) {
    console.log('value', value)
  })
}, function(err) {
  console.error('err', err)
})