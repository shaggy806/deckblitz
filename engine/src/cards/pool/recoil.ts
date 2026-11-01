import { defineCard } from "../define.js";

// "That player" is the permanent's owner, whose hand it went to.

export default defineCard({
  name: "Recoil",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Return target permanent to its owner's hand. Then that player discards a card.",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "discard", target: { ownerOfTarget: 0 }, amount: 1 },
    ],
  },
});
