import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31264. Vexing Beetle's "no opponent controls"
// (the negation of "some opponent controls one") with a white-or-blue filter.
const TEXT = "This creature has haste as long as no opponent controls a white or blue creature.";

export default defineCard({
  name: "Kavu Runner",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  text: TEXT,
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
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
