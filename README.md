[![Build Status](https://travis-ci.org/accosine/hapi-relax.svg)](https://travis-ci.org/accosine/hapi-relax)[![Code Climate](https://codeclimate.com/github/accosine/hapi-relax/badges/gpa.svg)](https://codeclimate.com/github/accosine/hapi-relax)[![Test Coverage](https://codeclimate.com/github/accosine/hapi-relax/badges/coverage.svg)](https://codeclimate.com/github/accosine/hapi-relax)[![Dependency Status](https://david-dm.org/accosine/hapi-relax.svg)](https://david-dm.org/accosine/hapi-relax)
## hapi-relax

[**hapi**](https://github.com/hapijs/hapi) plugin that registers server methods using [**nano**](https://github.com/dscape/nano) and extends it by taking care of cookie authentication

### Introduction
hapi-relax enhances your hapi server by an interface for a specified CouchDB database.  
If you're using cookie authentication on top of basic-auth you can also pass a username and password. Just relax and stop worrying about authentication because the plugin will check if you are authorized. If not it will use nano's auth method to get a cookie and use that in a further request. But you won't  notice because that all happens internally.  
It will also update its cookie when CouchDB sends a new cookie in the headers.

### Usage
```
const Hapi = require('hapi');
const server = new Hapi.Server({ port: 80 });
const options = { nano: { db: 'testDb' } };

server.register({ plugin: require('hapi-relax'), options }).then((err) => {
});

server.start();
```

The plugin takes the following options:

- `nano` - optional config object which nano will be initialized with.  
`db` is required. Defaults to `{ url: 'http://localhost:5984' }`
- `user` - optional database username
- `password` - optional password for your database user; required if user is passed
- `prefix` - optional namespace in which the server methods will be registered;  
required if the plugin is registered multiple times e.g. for multiple databases or hosts. Defaults to `nano`

### API
[**nano's**](https://github.com/dscape/nano) API remains unchanged

- info
- replicate
- compact
- changes
- follow
- session
- insert
- get
- head
- copy
- destroy
- bulk
- list
- fetch
- fetchRevs
- show
- atomic
- updateWithHandler
- search
- spatial
- view
- viewWithList
- multipart: {insert, get}
- attachment: {insert, get, destroy}


### Example
```
const Hapi = require('hapi');

const server = new Hapi.Server({ port: 8080 });

const plugins = [{
  plugin: require('../index'),
  options: {
    nano: {
      url: 'http://localhost:5984',
      db: 'db1'
    },
    user: 'root',
    password: 'secret'
  }
},
{
  plugin: require('../index'),
  options: {
    nano: {
      url: 'http://localhost:5984',
      db: 'db2'
    },
    user: 'alice',
    password: 'rabbit',
    prefix: 'db2'
  }
}];

server.register(plugins).then((err) => {
    throw err;
});

server.route({
    method: 'GET',
    path: '/db1/{key}',
    handler(request, h) {
      const key = encodeURIComponent(request.params.key);
      server.methods.nano.get(key, function (err, body, headers) {
        if (err && err.reason === 'missing') {
          return h.response('Document does not exist').code(404);
        }
        else {
          return body;
        }
      });
    }
});

server.route({
    method: 'GET',
    path: '/db2/{key}',
    handler(request, h) {
      const key = encodeURIComponent(request.params.key);
      server.methods.db2.get(key, function (err, body, headers) {
        if (err && err.reason === 'missing') {
          return h.response('Document does not exist').code(404);
        }
        else {
          return body;
        }
      });
    }
});

server.start().then(() => {
    console.log('Server running at:', server.info.uri);
}).catch((err) => {
    throw err;
});
```
