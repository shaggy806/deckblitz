import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31355. Vexing Beetle's condition, narrowed to
// white or blue creatures.

const PUMP = "This creature gets +1/+1 as long as no opponent controls a white or blue creature.";

export default defineCard({
  name: "Skittish Kavu",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 1,
  toughness: 1,
  text: PUMP,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: {
          kind: "opponent-controls",
          filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
          atLeast: 1,
        },
      },
      grantPt: [1, 1],
      text: PUMP,
    },
  ],
});
