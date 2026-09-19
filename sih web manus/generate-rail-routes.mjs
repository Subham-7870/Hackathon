import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const corridors = [
  { sector: "SEC-NDLS-CNB-01", from: [28.6438, 77.2197], to: [26.4605, 80.3216], bbox: [25.8, 76.7, 29.2, 80.8] },
  { sector: "SEC-HWH-BWN-02", from: [22.5839, 88.3433], to: [23.2324, 87.8615], bbox: [22.1, 87.4, 23.7, 88.8] },
  { sector: "SEC-BCT-BRC-03", from: [18.9691, 72.8205], to: [22.3072, 73.1812], bbox: [18.4, 72.2, 22.9, 73.8] },
  { sector: "SEC-MAS-BZA-01", from: [13.0827, 80.2707], to: [16.5137, 80.6103], bbox: [12.4, 79.6, 17.2, 81.2] },
  { sector: "SEC-SBC-MYS-01", from: [12.9773, 77.5704], to: [12.3108, 76.6558], bbox: [11.7, 76.1, 13.6, 78.1] },
];

class MinHeap {
  constructor() { this.values = []; }
  push(value) {
    this.values.push(value);
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.values[parent][0] <= value[0]) break;
      this.values[index] = this.values[parent];
      index = parent;
    }
    this.values[index] = value;
  }
  pop() {
    if (this.values.length === 0) return null;
    const root = this.values[0];
    const tail = this.values.pop();
    if (this.values.length > 0) {
      let index = 0;
      while (true) {
        let child = index * 2 + 1;
        if (child >= this.values.length) break;
        if (child + 1 < this.values.length && this.values[child + 1][0] < this.values[child][0]) child += 1;
        if (this.values[child][0] >= tail[0]) break;
        this.values[index] = this.values[child];
        index = child;
      }
      this.values[index] = tail;
    }
    return root;
  }
  get size() { return this.values.length; }
}

function distance(a, b) {
  const latScale = 111_320;
  const lngScale = 111_320 * Math.cos(((a[0] + b[0]) / 2) * Math.PI / 180);
  return Math.hypot((a[0] - b[0]) * latScale, (a[1] - b[1]) * lngScale);
}

function buildGraph(elements) {
  const coords = new Map();
  const graph = new Map();
  const attach = (from, to, weight) => {
    const links = graph.get(from) ?? [];
    links.push([to, weight]);
    graph.set(from, links);
  };

  for (const way of elements) {
    if (way.type !== "way" || !way.nodes || !way.geometry || way.nodes.length !== way.geometry.length) continue;
    for (let index = 0; index < way.nodes.length; index += 1) {
      coords.set(way.nodes[index], [way.geometry[index].lat, way.geometry[index].lon]);
    }
    for (let index = 1; index < way.nodes.length; index += 1) {
      const previous = way.nodes[index - 1];
      const current = way.nodes[index];
      const weight = distance(coords.get(previous), coords.get(current));
      attach(previous, current, weight);
      attach(current, previous, weight);
    }
  }
  return { coords, graph };
}

function nearestNode(coords, point) {
  let winner = null;
  let winnerDistance = Infinity;
  for (const [id, coord] of coords.entries()) {
    const candidateDistance = distance(coord, point);
    if (candidateDistance < winnerDistance) {
      winner = id;
      winnerDistance = candidateDistance;
    }
  }
  if (!winner || winnerDistance > 5_000) throw new Error(`No railway node found within 5 km of ${point.join(",")}`);
  return winner;
}

function shortestPath(graph, start, end) {
  const queue = new MinHeap();
  const distances = new Map([[start, 0]]);
  const previous = new Map();
  queue.push([0, start]);

  while (queue.size > 0) {
    const [currentDistance, current] = queue.pop();
    if (current === end) break;
    if (currentDistance !== distances.get(current)) continue;
    for (const [next, weight] of graph.get(current) ?? []) {
      const nextDistance = currentDistance + weight;
      if (nextDistance < (distances.get(next) ?? Infinity)) {
        distances.set(next, nextDistance);
        previous.set(next, current);
        queue.push([nextDistance, next]);
      }
    }
  }

  if (!previous.has(end)) throw new Error("No connected railway path was found in the selected OSM network.");
  const path = [end];
  while (path[path.length - 1] !== start) path.push(previous.get(path[path.length - 1]));
  return path.reverse();
}

function perpendicularDistance(point, start, end) {
  const x = point[1];
  const y = point[0];
  const x1 = start[1];
  const y1 = start[0];
  const x2 = end[1];
  const y2 = end[0];
  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
  const denominator = Math.hypot(y2 - y1, x2 - x1);
  return denominator === 0 ? Math.hypot(x - x1, y - y1) : numerator / denominator;
}

function simplify(points, tolerance = 0.0012) {
  if (points.length < 3) return points;
  let index = -1;
  let greatestDistance = 0;
  for (let pointer = 1; pointer < points.length - 1; pointer += 1) {
    const candidateDistance = perpendicularDistance(points[pointer], points[0], points[points.length - 1]);
    if (candidateDistance > greatestDistance) {
      index = pointer;
      greatestDistance = candidateDistance;
    }
  }
  if (greatestDistance > tolerance) {
    return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
  }
  return [points[0], points[points.length - 1]];
}

async function requestRailways(bbox) {
  const query = `[out:json][timeout:180];way["railway"="rail"](${bbox.join(",")});out body geom;`;
  const response = execFileSync("curl", [
    "--fail",
    "--silent",
    "--show-error",
    "--max-time",
    "180",
    "--data-urlencode",
    `data=${query}`,
    "https://overpass-api.de/api/interpreter",
  ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(response);
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const cacheDirectory = path.resolve(".rail-cache");
fs.mkdirSync(cacheDirectory, { recursive: true });

const output = {};
for (const corridor of corridors) {
  const cachePath = path.join(cacheDirectory, `${corridor.sector}.json`);
  let data;
  if (fs.existsSync(cachePath)) {
    console.log(`Using cached ${corridor.sector}`);
    data = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  } else {
    console.log(`Waiting before fetching ${corridor.sector}`);
    await wait(25_000);
    data = await requestRailways(corridor.bbox);
    fs.writeFileSync(cachePath, JSON.stringify(data));
  }
  const { coords, graph } = buildGraph(data.elements);
  const start = nearestNode(coords, corridor.from);
  const end = nearestNode(coords, corridor.to);
  const route = shortestPath(graph, start, end).map((nodeId) => coords.get(nodeId));
  const simplified = simplify(route).map(([lat, lng]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  output[corridor.sector] = simplified;
  console.log(`${corridor.sector}: ${route.length} rail nodes simplified to ${simplified.length} points`);
}

const fileContents = `/**\n * Rail-aligned route geometry derived from OpenStreetMap railway=rail ways via Overpass API.\n * Coordinates are [latitude, longitude] and are simplified for browser map performance.\n * © OpenStreetMap contributors, licensed under ODbL.\n */\nexport const railRouteCoordinates: Record<string, [number, number][]> = ${JSON.stringify(output, null, 2)};\n`;
const outputPath = path.resolve("client/src/data/railRoutes.ts");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fileContents);
console.log(`Wrote ${outputPath}`);
