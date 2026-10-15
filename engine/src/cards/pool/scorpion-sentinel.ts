import { defineCard } from "../define.js";

// EDHREC rank 19362.

const PUMP_TEXT = "As long as you control seven or more lands, this creature gets +3/+0.";

export default defineCard({
  name: "Scorpion Sentinel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scorpion"],
  power: 1,
  toughness: 4,
  text: PUMP_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7, countsSelf: true },
      grantPt: [3, 0],
      text: PUMP_TEXT,
    },
  ],
});
