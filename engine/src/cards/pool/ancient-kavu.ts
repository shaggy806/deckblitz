import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31537.
//
// Rulings:
//   [2004-10-04] Making a permanent colorless does not make it into an artifact.

const TEXT = "{2}: This creature becomes colorless until end of turn.";

export default defineCard({
  name: "Ancient Kavu",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "become-color", target: "source", colors: [], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
