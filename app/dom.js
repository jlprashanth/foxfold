// Tiny DOM helpers. Content text allows only **bold** and `code`; never raw HTML.
export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k.startsWith('on')) n[k] = v;
    else n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
}

// Same idea for inline SVG (needs the SVG namespace).
export function svg(tag, attrs = {}, ...kids) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k.startsWith('on')) n[k] = v;
    else n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
}

export function richText(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((p) =>
    p.startsWith('**') ? el('strong', {}, p.slice(2, -2))
      : p.startsWith('`') ? el('code', {}, p.slice(1, -1))
      : p);
}
