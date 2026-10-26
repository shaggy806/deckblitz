import { defineCard } from "../define.js";

// EDHREC rank 29543.
//
// The third cost is blight 1 under another name (rule 701.68a — Wandering
// Mage's shape): one -1/-1 counter on a creature you control, chosen as it's
// paid.

const TEXT = "{2}{R}, {T}, Put a -1/-1 counter on a creature you control: This creature deals 2 damage to any target.";

export default defineCard({
  name: "Hatchet Bully",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, blight: 1 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
