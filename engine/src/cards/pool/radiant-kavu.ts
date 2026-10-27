import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 28932.

const TEXT = "{R}{G}{W}: Prevent all combat damage blue creatures and black creatures would deal this turn.";

export default defineCard({
  name: "Radiant Kavu",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-all-combat-damage",
        by: { type: "creature", anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
