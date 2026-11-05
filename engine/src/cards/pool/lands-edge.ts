import { defineCard } from "../define.js";

// EDHREC rank 20328.

export default defineCard({
  name: "Land's Edge",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: "Discard a card: If the discarded card was a land card, this enchantment deals 2 damage to target player or planeswalker. Any player may activate this ability.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "conditional",
        condition: { kind: "discarded", filter: { type: "land" } },
        then: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: "Discard a card: If the discarded card was a land card, this enchantment deals 2 damage to target player or planeswalker. Any player may activate this ability.",
      anyPlayer: true,
    },
  ],
});
