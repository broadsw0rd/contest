import App from './app.js'

function loop (t) {
  app.digest(t)
  requestAnimationFrame(loop)
}

var requestAnimationFrame = window.requestAnimationFrame
var element = document.getElementById('root')
var app = new App(element)

app.load()
loop()

export default app
