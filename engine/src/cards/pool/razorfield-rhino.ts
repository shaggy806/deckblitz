import { defineCard } from "../define.js";

const TEXT = "Metalcraft — This creature gets +2/+2 as long as you control three or more artifacts.";

export default defineCard({
  name: "Razorfield Rhino",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Rhino"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "metalcraft" }, grantPt: [2, 2], text: TEXT }],
});
