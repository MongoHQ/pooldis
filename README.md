# pooldis

A redis client with pooled connections and promises.

## Known issues

- Virtually no tests.

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