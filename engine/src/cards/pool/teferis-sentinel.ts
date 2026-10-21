import { defineCard } from "../define.js";

// EDHREC rank 30034. Dominaria.

const TEXT = "As long as you control a Teferi planeswalker, this creature gets +4/+0.";

export default defineCard({
  name: "Teferi's Sentinel",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 6,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Teferi" }, atLeast: 1, countsSelf: true },
      grantPt: [4, 0],
      text: TEXT,
    },
  ],
});
