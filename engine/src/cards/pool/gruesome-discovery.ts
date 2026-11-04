import { defineCard } from "../define.js";

// Morbid, read as it resolves: the player's own choice of two without it, the caster's with it.

export default defineCard({
  name: "Gruesome Discovery",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards.\nMorbid — If a creature died this turn, instead that player reveals their hand, you choose two cards from it, then that player discards those cards.",
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: { kind: "creature-died-this-turn" },
    then: { kind: "discard-chosen", target: 0, picks: 2 },
    else: { kind: "discard", target: 0, amount: 2 },
  },
});
