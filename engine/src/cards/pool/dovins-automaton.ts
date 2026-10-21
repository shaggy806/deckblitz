import { defineCard } from "../define.js";

// EDHREC rank 30077.
const TEXT =
  "As long as you control a Dovin planeswalker, this creature gets +2/+2 and has vigilance. (Attacking doesn't cause it to tap.)";

export default defineCard({
  name: "Dovin's Automaton",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Homunculus"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Dovin" }, atLeast: 1 },
      grantPt: [2, 2],
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
