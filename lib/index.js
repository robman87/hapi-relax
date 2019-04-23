const Hoek = require('hoek')
  , Nano = require('nano')
  , url = require('url')
  , pkg = require('../package.json');
const internals = {};
internals.defaults = {
  nano: {
    url: 'http://localhost:5984'
  },
  prefix: 'nano'
};

internals.api = [
  'info',
  'replicate',
  'compact',
  'changes',
  'follow',
  'session',
  'insert',
  'get',
  'head',
  'copy',
  'destroy',
  'bulk',
  'list',
  'fetch',
  'fetchRevs',
  'show',
  'atomic',
  'updateWithHandler',
  'search',
  'view',
  'viewWithList',
  'multipart.insert',
  'multipart.get',
  'attachment.insert',
  'attachment.get',
  'attachment.destroy'
];

const register = async (server, options) => {
  const prefix = options.prefix || internals.defaults.prefix;
  // return error if server methods prefix is already in use
  if (server.methods[prefix]) {
    return new Error('There is already a plugin registered with the prefix \'' + prefix + '\'');
  }
  internals[prefix] = {};

  // save reference to plugin instance namespace
  const ns = internals[prefix];
  ns.options = Hoek.applyToDefaults(internals.defaults, options);
  ns.options.nano.url = url.resolve(ns.options.nano.url, ns.options.nano.db);
  
  // Must set requestDefaults.jar = true for auth cookie auth to work
  if (ns.options.user && ns.options.password) {
    if (!ns.options.nano.requestDefaults) {
      ns.options.nano.requestDefaults = {}
    }
    ns.options.nano.requestDefaults.jar = true
  }
  
  ns.nano = Nano(ns.options.nano);

  if(ns.options.user && ns.options.password) {
    try {
      await ns.nano.auth(ns.options.user, ns.options.password);
    } catch(err) {
      server.log(['error', 'couchdb'], err)
    }
  }

  internals.registerServerMethods(server, prefix);
};

// registers server methods
internals.registerServerMethods = function registerServerMethods (server, prefix) {
  const methods = [];

  const ns = internals[prefix]
  const retryAuth = ns.options.retryAuth && `${ns.options.user}`.trim() !== '' && `${ns.options.password}`.trim() !== ''

  // register all server methods
  internals.api.forEach(function (name) {
    const method = Hoek.reach(internals, [prefix, 'nano', name].join('.'))
    if (typeof method === 'function') {
      methods.push({
        name: prefix + '.' + name,
        method: retryAuth ? method : async function retryWrapper() {
          try {
            return await method.apply(null, arguments)
          } catch(err) {
            if (err.statusCode !== 401) {
              throw err
            }
            server.log(['warn', 'couchdb'], err)
          }

          await ns.nano.auth(ns.options.user, ns.options.password)

          return await method.apply(null, arguments)
        }
      });
    } else {
      server.log(['error', 'plugin', 'nano', pkg.name], `Function ${name} is not a function in module nano and can't be registered as a server method.`);
      console.error(`Function ${name} is not a function in module nano and can't be registered as a server method.`);
    }
  });

  server.method(methods);
};

exports.plugin = {
  register,
  pkg: require('../package.json'),
  multiple: true
};
