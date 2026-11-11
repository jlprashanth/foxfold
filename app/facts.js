// {{facts.path}} references: fast-changing facts live in content/facts.json only.
// Names are reached by id: "{{facts.apps.mobile}}" is the name of the app whose id is "mobile".
// A whole-string reference in a list field ("baskets", "options") becomes an array of names;
// anywhere else, a reference is replaced by text (lists are joined with commas).
const LIST_KEYS = new Set(['baskets', 'options']);
const REF = /\{\{facts\.([\w.]+)\}\}/g;
const WHOLE = /^\{\{facts\.([\w.]+)\}\}$/;

// Path steps may be a list index or, in a list of objects, an item's "id" (e.g. facts.apps.mobile).
const step = (o, k) => (Array.isArray(o) ? o.find((x) => x && x.id === k) ?? o[k] : o[k]);
const lookup = (facts, path) => path.split('.').reduce((o, k) => (o == null ? undefined : step(o, k)), facts);
const nameOf = (x) => (x && typeof x === 'object' ? String(x.name) : String(x));
const asNames = (v) => (Array.isArray(v) ? v.map(nameOf) : [nameOf(v)]);

// Returns a copy of `node` with references filled in. Unknown paths are pushed onto `missing`.
export function resolveFacts(node, facts, missing = [], key = '') {
  if (typeof node === 'string') {
    const whole = node.match(WHOLE);
    if (whole && LIST_KEYS.has(key)) {
      const v = lookup(facts, whole[1]);
      if (v === undefined) { missing.push(whole[1]); return node; }
      return asNames(v);
    }
    return node.replace(REF, (m, path) => {
      const v = lookup(facts, path);
      if (v === undefined) { missing.push(path); return m; }
      return asNames(v).join(', ');
    });
  }
  if (Array.isArray(node)) {
    const out = node.map((x) => resolveFacts(x, facts, missing, key));
    return LIST_KEYS.has(key) ? out.flat() : out; // a list of single references stays one flat list
  }
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolveFacts(v, facts, missing, k)]));
  }
  return node;
}
