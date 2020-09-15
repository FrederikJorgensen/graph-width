export default function generateRandomGraph(n, m) {
  const maxNumEdges = (n * (n - 1)) / 2;
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined;

  const graph = { nodes: [], links: [] };

  for (let i = 0; i < n; i++) {
    graph.nodes[i] = { id: i + 1, label: i + 1 };
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);

  const state = {};
  for (let i = 0; i < m; i++) {
    const j = randomInt(i, maxNumEdges);
    if (!(i in state)) state[i] = i;
    if (!(j in state)) state[j] = j;
    [state[i], state[j]] = [state[j], state[i]];
  }

  function unpair(k) {
    const z = Math.floor((-1 + Math.sqrt(1 + 8 * k)) / 2);
    return [k - (z * (1 + z)) / 2, (z * (3 + z)) / 2 - k];
  }

  for (let i = 0; i < m; i++) {
    const [x, y] = unpair(state[i]);
    const u = graph.nodes[x];
    const v = graph.nodes[n - 1 - y];
    graph.links.push({ source: u, target: v });
  }
  return graph;
}

export function hull(points) {
  if (points.length < 2) return;
  if (points.length < 3) return d3.polygonHull([points[0], ...points]);
  return d3.polygonHull(points);
}

export async function readLocalFile(file) {
  const response = await fetch(file);
  const text = await response.text();
  window.n = text.split('\n');
}

export function deepClone(obj) {
  if (!obj || obj == true) // this also handles boolean as true and false
  { return obj; }
  const objType = typeof (obj);
  if (objType == 'number' || objType == 'string') // add your immutables here
  { return obj; }
  const result = Array.isArray(obj) ? [] : !obj.constructor ? {} : new obj.constructor();
  if (obj instanceof Map) for (var key of obj.keys()) result.set(key, deepClone(obj.get(key)));
  for (var key in obj) if (obj.hasOwnProperty(key)) result[key] = deepClone(obj[key]);
  return result;
}

export function compareMaps(map1, map2) {
  let testVal;
  if (map1.size !== map2.size) {
    return false;
  }
  for (const [key, val] of map1) {
    testVal = map2.get(key);
    // in cases of an undefined value, make sure the key
    // actually exists on the object so there are no false positives
    if (testVal !== val || (testVal === undefined && !map2.has(key))) {
      return false;
    }
  }
  return true;
}

export function isMapInArray(map, array) {
  for (const m of array) {
    if (compareMaps(map, m)) return true;
  }
  return false;
}

export function sumObjectsByKey(...objs) {
  return objs.reduce((a, b) => {
    for (const k in b) {
      if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k];
    }
    return a;
  }, {});
}

export function getKeysAsInts(obj) {
  const keys = Object.keys(obj);

  const intArray = [];

  keys.forEach((key) => {
    const int = parseInt(key, 10);
    intArray.push(int);
  });

  return intArray;
}

export function setNavbarHeight() {
  d3.select('.nav-wrapper').style('height', '5%');
  d3.select('.nav-wrapper').style('visibility', 'visible');
  d3.select('#main').style('height', '95%');
}
