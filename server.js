const Hapi = require('hapi')
require('env2')('./config.env')

const users = [{
  id: 1,
  username: 'tas'
}]

const validate = (decoded, request, callback) => {
  if(!users[decoded.id])
    return callback(null, false)
  else
    return callback(null, true)
}

const server = new Hapi.Server()

server.connection({ port: 3000 })

server.register(require('hapi-auth-jwt2'), (err) => {
  if (err) throw err

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.KEY,
    validateFunc: validate,
    verifyOptions: { algorithms: ['HS256'] }
  })

  server.auth.default('jwt')

  server.route([
    {
      method: 'GET',
      path: '/',
      config: { auth: false },
      handler: (request, reply) => {
        reply({ text: 'auth not required' })
      }
    },
    {
      method: 'GET',
      path: '/restricted',
      config: { auth: 'jwt' },
      handler: (request, reply) => {
        reply({ text: 'you used token' })
          .header('Authorization', request.headers.authorization)
      }
    }
  ])
})

server.start((err) => {
  if (err) throw err
  console.log('server running at ' + server.info.uri)
})
