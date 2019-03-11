import App from './app.js'

var element = document.getElementById('#root')
var app = new App(element)

app.load()
app.digest()
