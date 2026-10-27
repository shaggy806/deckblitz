import { defineCard } from "../define.js";

// EDHREC rank 26820.

export default defineCard({
  name: "Scandalmonger",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Boar", "Monger"],
  power: 3,
  toughness: 3,
  text: "{2}: Target player discards a card. Any player may activate this ability but only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: "{2}: Target player discards a card. Any player may activate this ability but only as a sorcery.",
      anyPlayer: true,
      sorcerySpeed: true,
    },
  ],
});
