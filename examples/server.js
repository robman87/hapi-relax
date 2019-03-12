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

server.register(plugins)
  .then(function () {
    server.route([
      {
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
      },
      {
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
      },
      {
        method: 'GET',
        path: '/async/db1/{key}',
        async handler(request, h) {
          const key = encodeURIComponent(request.params.key);
          try {
            const response = await server.methods.nano.get(key)
            return response;
          } catch (err) {
            if (err.reason === 'missing') {
              return h.response('Document does not exist').code(404);
            }
            return err;
          }
        }
      },
      {
        method: 'GET',
        path: '/async/db2/{key}',
        async handler(request, h) {
          const key = encodeURIComponent(request.params.key);
          try {
            const response = await server.methods.db2.get(key);
            return response;
          } catch (err) {
            if (err.reason === 'missing') {
              return h.response('Document does not exist').code(404);
            }
            return err;
          }
        }
      }
    ]);

    server.start()
  })
  .then(() => {
    console.log('Server running at:', server.info.uri)
  }).catch((err) => {
    throw err
  })
