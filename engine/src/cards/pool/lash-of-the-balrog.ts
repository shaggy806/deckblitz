import { defineCard } from "../define.js";

// EDHREC rank 7357.
//
// Rulings:
//   [2023-06-16] Players can respond to Lash of the Balrog only after it's been cast and all its
//     costs have been paid. No one can try to destroy the creature you sacrificed to stop you from
//     casting this spell or to make it cost more mana.
//   [2023-06-16] You must sacrifice exactly one creature or pay an extra {4} to cast this spell;
//     you can't cast it without paying one of those costs, and you can't pay either multiple
//     times.

export default defineCard({
  name: "Lash of the Balrog",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature or pay {4}.\nDestroy target creature.",
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Pay {4}", mana: "{4}" },
    ],
  },
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
