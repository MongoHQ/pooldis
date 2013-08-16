var events  = require('events')
  , hiredis = require('hiredis')
  , util    = require('util')

function Parser() {
  events.EventEmitter.call(this)
  this.reset()
}

util.inherits(Parser, events.EventEmitter)

Parser.prototype.reset = function() {
  this._reader = new hiredis.Reader()
}

Parser.prototype.execute = function(chunk) {
  this._reader.feed(chunk)

  var reply
  while (true) {
    try {
      reply = this._reader.get()
    } catch (err) {
      this.emit('error', err)
      break
    }

    if (reply === undefined) break

    this.emit('reply', reply)
  }
}

module.exports = Parser
