module.exports = {
  'plugins': {
    'a': [
      {
        'plugin': require('../index'),
        'options': {
          'nano': {
            'url': 'http://localhost:5984',
            'db': 'alice'
          },
          'user': 'root',
          'password': 'asdf'
        }
      },
      {
        'plugin': require('../index'),
        'options': {
          'nano': {
            'url': 'http://localhost:5984',
            'db': 'test'
          },
          'user': 'root',
          'password': 'asdf',
          'prefix': 'customPrefix'
        }
      }
    ],
    'b': [
      {
        'plugin': require('../index'),
        'options': {
          'nano': {
            'url': 'http://localhost:5984',
            'db': 'test2'
          },
          'user': 'root',
          'password': 'asdf',
          'prefix': 'customPrefix'
        }
      },
      {
        'plugin': require('../index'),
        'options': {
          'nano': {
            'url': 'http://localhost:5984',
            'db': 'wrong'
          },
          'user': 'root',
          'password': 'asdf',
          'prefix': 'wrong'
        }
      }
    ],
    'c': [
      {
        'plugin': require('../index'),
        'options': {
          'nano': {
            'url': 'http://localhost:5984',
            'db': 'test2'
          },
          'user': 'root',
          'password': 'wrong',
          'prefix': 'wrongPw'
        }
      }
    ]
  }
};
