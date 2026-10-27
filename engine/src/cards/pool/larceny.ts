import { defineCard } from "../define.js";

// EDHREC rank 16950. Once per creature, not per
// point of damage (its ruling).

const TEXT = "Whenever a creature you control deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Larceny",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      resolve: null,
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      text: TEXT,
    },
  ],
});
