const { createServer } = require('http')
const { readFile } = require('fs')
const { resolve } = require('path')
const { Server } = require('socket.io')
const { createStateMiddleware } = require('../index')

const SERVER_PORT = 3000

const staticServer = (req, res) => {
  const basePath = resolve(__dirname)

  const serveFile = (path) => {
    readFile(path, (err, data) => {
      if (err) {
        res.writeHead(500)
        res.end(err)
      }
      res.writeHead(200)
      res.end(data)
    })
  }

  console.log(`[http server] serving ${req.url}`)
  if ( ['/', '/index.html'].includes(req.url)) {
    serveFile(resolve(basePath, 'index.html'))
  } else if( req.url === '/client.js' ) {
    serveFile(resolve(basePath, 'client.js'))
  } else {
    console.log(`[http server] not found: ${req.url}`)
    res.writeHead(404)
    res.end()  
  }
}

const httpServer = createServer(staticServer)
const io = new Server(httpServer, { path: '/socket.io/' })
io.use(createStateMiddleware())

io.on("connection", (socket) => {
  console.log("[socket.io] Connected.")
});

httpServer.listen(SERVER_PORT, () => {
  console.log(`[http server] started on http://localhost:${SERVER_PORT}`)
});
