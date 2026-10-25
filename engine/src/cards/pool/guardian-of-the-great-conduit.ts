import { defineCard } from "../define.js";

// EDHREC rank 29806.

const TEXT =
  "As long as you control a Nissa planeswalker, this creature gets +2/+0 and has vigilance. (Attacking doesn't cause it to tap.)";

export default defineCard({
  name: "Guardian of the Great Conduit",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Nissa" }, atLeast: 1 },
      grantPt: [2, 0],
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
