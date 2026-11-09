import { defineCard } from "../define.js";

// Mercadian Masques. The target's power is read once, as the ability
// resolves (rule 608.2h), and the base power it sets lasts indefinitely.

const ABILITY =
  "{1}{U}: This creature's base power becomes equal to target creature's power. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Riptide Mangler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 3,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "become",
        target: "source",
        power: { powerOf: 0 },
        duration: "permanent",
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
