import { defineCard } from "../define.js";

// EDHREC rank 12833.

export default defineCard({
  name: "Ignite Memories",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target player reveals a card at random from their hand. Ignite Memories deals damage to that player equal to that card's mana value.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["player"],
  effect: {
    kind: "choose-random-card",
    zone: "hand",
    whose: 0,
    show: "reveal",
    slot: 1,
    then: { kind: "damage", target: 0, amount: { manaValueOf: 1 } },
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
