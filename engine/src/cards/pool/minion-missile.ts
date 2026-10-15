import { defineCard } from "../define.js";

// EDHREC rank 25087.
//
// Bone Shards' choice of costs, then Unlicensed Disintegration's damage to
// "that creature's controller" — unconditional here, and dealt whether or not
// the destroy did anything (an indestructible creature's controller still
// takes 2). The controller is read as the creature last was on the
// battlefield.

export default defineCard({
  name: "Minion Missile",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature or discard a card.\nDestroy target creature. Minion Missile deals 2 damage to that creature's controller.",
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Discard a card", discard: 1 },
    ],
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
