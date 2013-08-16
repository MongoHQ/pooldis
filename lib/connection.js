var events = require('events')
  , debug  = require('debug')('pooldis:connection')
  , Parser = require('./parser')
  , Q      = require('q')
  , util   = require('util')
  , _      = require('underscore')

var REPLY_TYPES = {
  message: ['message', 'pmessage'],
  subscriber: ['subscribe', 'unsubscribe', 'psubscribe', 'punsubscribe']
}

/**
 * Connection provides the methods described in the commands.js dsl, but
 * does no state checking. The higher-level pooldis object should ensure
 * that a subscriber connection only does subscribing, etc.
 * @constructor
 * @param {stream.Duplex} stream - The initiated stream to the redis server
 * @param {hash} options
 */
function Connection(stream, options) {
  debug('creating new connection')

  var self = this

  events.EventEmitter.call(this)
  
  this._stream   = stream
  this._parser   = new Parser()
  this._pipeline = []

  this._stream.on('data', this._parser.execute.bind(this._parser))

  this._parser.on('reply', this._on_reply.bind(this))
  this._parser.on('error', function(err) {
    self.emit('error', new Error('Parser error: ' + error.stack))
  })
}

util.inherits(Connection, events.EventEmitter)

/**
 * send writes a well-formatted redis command
 * @param {[string...]} arguments - The command and following arguments
 */
Connection.prototype.send = function() {
  var deferred = Q.defer()
    , command
    , args
    , buffer

  command = Array.prototype.slice.call(arguments, 0, 1)[0]
  args    = Array.prototype.slice.call(arguments, 1)

  debug('sending', command, args)

  buffer = '*' + (1 + args.length) + '\r\n'
  buffer += '$' + Buffer.byteLength(command) + '\r\n' + command + '\r\n'
  args.forEach(function(arg) {
    buffer += '$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n'
  })
  buffer = new Buffer(buffer)
  this._pipeline.push(deferred)
  this._stream.write(buffer)

  return deferred.promise
}

Connection.prototype._on_reply = function(reply) {
  debug('on_reply', reply)

  if (reply && _.contains(REPLY_TYPES.message, reply[0])) {
    return this.emit.apply(this, reply)
  }

  var deferred = this._pipeline.shift()

  if (deferred) {
    if (reply && reply.constructor === Error) {
      deferred.reject(reply)
    } else {
      deferred.resolve(reply)
    }

    // also emit subscription events in addition to resolving
    if (reply && _.contains(REPLY_TYPES.subscriber, reply[0])) {
      this.emit.apply(this, reply)
    }
  } else if (reply && _.contains(REPLY_TYPES.subscriber, reply[0])) {
    this.emit.apply(this, reply)
  } else { // assume monitor
    this.emit('monitor', reply)
  }
}

module.exports = Connection
