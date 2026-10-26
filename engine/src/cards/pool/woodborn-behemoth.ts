import { defineCard } from "../define.js";

const TEXT =
  "As long as you control eight or more lands, this creature gets +4/+4 and has trample. (It can deal excess combat damage to the player or planeswalker it's attacking.)";

export default defineCard({
  name: "Woodborn Behemoth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 8, countsSelf: true },
      grantPt: [4, 4],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
