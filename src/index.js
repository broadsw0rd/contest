import App from './app.js'

var requestAnimationFrame = window.requestAnimationFrame

function loop (t) {
  app.digest(t)
  requestAnimationFrame(loop)
}

var element = document.getElementById('root')
var app = new App(element)

app.load()
loop()

export default app
