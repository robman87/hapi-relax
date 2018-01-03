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
