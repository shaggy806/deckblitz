import { defineCard } from "../define.js";

// EDHREC rank 22060. Ixalan. A static's `controls` condition leaves its own
// permanent out: "another" (Stampeding Horncrest).
const TEXT = "As long as you control another Dinosaur, this creature gets +2/+0 and has trample.";

export default defineCard({
  name: "Thrash of Raptors",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      grantPt: [2, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
