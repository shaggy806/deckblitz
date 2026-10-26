import { defineCard } from "../define.js";

const TEXT = "Metalcraft — This creature gets +2/+2 as long as you control three or more artifacts.";

export default defineCard({
  name: "Chrome Steed",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horse"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "metalcraft" }, grantPt: [2, 2], text: TEXT }],
});
