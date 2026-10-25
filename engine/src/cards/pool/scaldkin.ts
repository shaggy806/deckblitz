import { defineCard } from "../define.js";

// EDHREC rank 31671.

const SAC_TEXT = "{2}{R}, Sacrifice this creature: It deals 2 damage to any target.";

export default defineCard({
  name: "Scaldkin",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
