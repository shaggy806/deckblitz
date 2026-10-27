import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 30955.

export default defineCard({
  name: "Chainflinger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: "{1}{R}, {T}: This creature deals 1 damage to any target.\nThreshold — {2}{R}, {T}: This creature deals 2 damage to any target. Activate only if there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}, {T}: This creature deals 1 damage to any target.",
    },
    {
      cost: { mana: "{2}{R}", tap: true },
      condition: { kind: "threshold" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "Threshold — {2}{R}, {T}: This creature deals 2 damage to any target. Activate only if there are seven or more cards in your graveyard.",
    },
  ],
});
