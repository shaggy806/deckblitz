import { defineCard } from "../define.js";

// Core Set 2020.
const PUMP_TEXT = "This creature gets +1/+1 as long as you control a Vivien planeswalker.";

export default defineCard({
  name: "Vivien's Crocodile",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Crocodile", "Spirit"],
  power: 3,
  toughness: 3,
  text: PUMP_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Vivien" }, atLeast: 1 },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
});
