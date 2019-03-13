var document = window.document

var create = name => document.createElement(name)

var text = (node, text) => (node.textContent = text)

var append = (node, child) => node.appendChild(child)

var addClass = (node, name) => node.classList.add(name)

var style = (node, name, value) => (node.style[name] = value)

var attr = (node, name, value) => node.setAttribute(name, value)

var on = (node, event, handler) => node.addEventListener(event, handler)

export {
  create,
  append,
  text,
  addClass,
  style,
  attr,
  on
}
