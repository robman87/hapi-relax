const Hapi = require('hapi')
const Boom = require('boom')

const server = new Hapi.Server({ port: 8080 })

const plugins = [{
  plugin: require('../index'),
  options: {
    nano: {
      url: 'http://localhost:5984',
      db: 'db1'
    },
    // user: 'root',
    // password: 'secret'
  }
},
{
  plugin: require('../index'),
  options: {
    nano: {
      url: 'http://localhost:5984',
      db: 'db2'
    },
    // user: 'alice',
    // password: 'rabbit',
    prefix: 'db2'
  }
}]

server.register(plugins)
  .then(function () {
    server.route([
      {
        method: 'GET',
        path: '/db1/{key}',
        handler(request, h) {
          const key = encodeURIComponent(request.params.key)
          return new Promise((resolve, reject) => {
            server.methods.nano.get(key, (err, body, headers) => {
              if (err) {
                reject(Boom.boomify(err, { statusCode: err.statusCode, message: body || err.description }))
              } else {
                resolve(body)
              }
            })
          })
        }
      },
      {
        method: 'GET',
        path: '/db2/{key}',
        handler(request, h) {
          const key = encodeURIComponent(request.params.key);
          return new Promise((resolve, reject) => {
            server.methods.db2.get(key, (err, body, headers) => {
              if (err) {
                reject(Boom.boomify(err, { statusCode: err.statusCode, message: body || err.description }))
              } else {
                resolve(body)
              }
            })
          })
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
            return Boom.boomify(err, { statusCode: err.statusCode, message: err.description })
          }
        }
      },
      {
        method: 'GET',
        path: '/async/db2/{key}',
        async handler(request, h) {
          const key = encodeURIComponent(request.params.key)
          try {
            const response = await server.methods.db2.get(key)
            return response
          } catch (err) {
            return Boom.boomify(err, { statusCode: err.statusCode, message: err.description })
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
