import { defineCard } from "../define.js";

const TEXT =
  "{1}{B}, Sacrifice this creature: Look at target player's hand and choose a card from it. That player discards that card. Activate only as a sorcery.";

export default defineCard({
  name: "Thrull Surgeon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "discard-chosen", target: 0, lookOnly: true },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
