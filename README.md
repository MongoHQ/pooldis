# pooldis

'dis be the most refreshing redis driver under the sun.

## Why

Pipelining is not always the speedy-fast solution. We use pipelining when the time complexity of an operation is O(1); otherwise, we use a dynamic pool of redis connections.

Promises allow a more natural way for a developer to handle results from redis. If you don't like promises... you can use callbacks too. We went the extra mile.

Manually setting up a second redis connection to handle pubsub subscriptions has been endured for too long. We handle this for you, like a good driver.

Setting up redis over a secure socket shouldn't be a hack (and I've done this hack). We just need a cloneable socket-like object to get going, but we'll accept a uri too.

## Why ditch pipelining? 

FIFO

With pipelining, the redis client is free to write multiple commands to redis before receiving any response, but the server must respond first-in-first-out. So, if I put a slow command in front of a fast command... my would-be fast command is now slow.

We can avoid putting fast commands behind slow ones by running time-consuming commands on their own available private connection to redis. Once the command finishes, the connection returns to the pool.

## Known issues

- Virtually no tests.
- A new and unhardened driver

## Usage

`npm install pooldis`

```javascript
var Pooldis = require("pooldis");
var redis = new Pooldis(); // more on that below...

redis.get("some:key").then(callback, errorHandler) // .then() ... and so on.
```

### Instantiation

```javascript
var Pooldis = function(url, options) { /*...*/ }
```

Either pass a valid redis `url` string, an `options` object or both.

#### URL

In the form of `redis://user:password@hostname:port` (`user:password` and `port` are not required)

#### Options

- `options.hostname` (String) - represents the redis server hostname to connect to.
- `options.port` (Number) - represents the redis server port to connect to.
- `options.password` (String) - if auth is required.

Any other options usually accepted by [node_redis](https://github.com/mranney/node_redis) will be passed along.

##### Pool options

Any of these in `options.pool` will be passed along to [node-pool](https://github.com/coopernurse/node-pool).

- `options.pool.max` (Number) - maximum number of acquirable connections.
- `options.pool.min` (Number) - minimum number of connections to hold.
- `options.pool.idleTimeoutMillis` (Number) - time in milliseconds before releasing a idle connection

### Commands

Executing redis commands uses the same syntax as [node_redis](https://github.com/mranney/node_redis).

#### Promises

Dis uses [Q](https://github.com/kriskowal/q) as its promises implementation. Here's how it works:

```javascript
var redis = new Pooldis()

redis.get("some:key")
.then(function(value){
  // Do something with `value`
}, function(error){
  // An error occurred. Handle it!
});
```

## Why pooled connections?

Due to the blocking nature operations (`BRPOP`, `BLPOP`, `BRPOPLPUSH`), it's best to have a connection pool at our disposal to perform other commands while waiting.

## Why promises?

For fun (and legibility).

## License

Licensed under MIT license

Copyright (c) 2013 MongoHQ Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.