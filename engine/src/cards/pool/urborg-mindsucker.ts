import { defineCard } from "../define.js";

// EDHREC rank 30854.

export default defineCard({
  name: "Urborg Mindsucker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 2,
  text: "{B}, Sacrifice this creature: Target opponent discards a card at random. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 1, random: true },
      resolve: null,
      text: "{B}, Sacrifice this creature: Target opponent discards a card at random. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
