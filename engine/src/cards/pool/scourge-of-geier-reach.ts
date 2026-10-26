import { defineCard } from "../define.js";

// EDHREC rank 25126.

const TEXT = "This creature gets +1/+1 for each creature your opponents control.";

export default defineCard({
  name: "Scourge of Geier Reach",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "opponent" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
