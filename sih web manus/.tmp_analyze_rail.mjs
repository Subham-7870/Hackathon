import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("/tmp/ndls-cnb-rails.json", "utf8"));
const ways = data.elements.filter((element) => element.type === "way");
const tags = new Map();

for (const way of ways) {
  const key = `${way.tags?.usage ?? ""}|${way.tags?.service ?? ""}|${way.tags?.name ?? ""}`;
  tags.set(key, (tags.get(key) ?? 0) + 1);
}

console.log(JSON.stringify({
  elements: data.elements.length,
  ways: ways.length,
  firstWay: ways[0],
  commonTags: [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
}, null, 2));
