var document = window.document

export function create (name) {
  return document.createElement(name)
}

export function select (el, selector) {
  return el.querySelector(selector)
}

export function selectAll (el, selector) {
  return el.querySelectorAll(selector)
}

export function append (root, el) {
  root.appendChild(el)
}

export function addClass (el, name) {
  el.classList.add(name)
}

export function removeClass (el, name) {
  el.classList.remove(name)
}

export function html (el, content) {
  el.innerHTML = content
}

export function css (el, name, value) {
  el.style[name] = value
}

export function text (el, content) {
  el.textContent = content
}

export function show (el) {
  css(el, 'display', 'block')
}

export function hide (el) {
  css(el, 'display', 'none')
}

export function on (el, event, handler) {
  el.addEventListener(event, handler)
}
