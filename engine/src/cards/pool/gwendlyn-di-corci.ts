import { defineCard } from "../define.js";

// EDHREC rank 24928.

export default defineCard({
  name: "Gwendlyn Di Corci",
  manaCost: "{U}{B}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 5,
  text: "{T}: Target player discards a card at random. Activate only during your turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1, random: true },
      resolve: null,
      text: "{T}: Target player discards a card at random. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
});
