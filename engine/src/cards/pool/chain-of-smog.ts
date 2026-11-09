import { defineCard } from "../define.js";

// EDHREC rank 3310. As Chain of Acid: the copy is the discarding player's.
export default defineCard({
  name: "Chain of Smog",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards. That player may copy this spell and may choose a new target for that copy.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      {
        kind: "each-player-may",
        who: { target: 0 },
        prompt: "Copy Chain of Smog? (You may choose a new target for the copy.)",
        effect: { kind: "copy-spell", target: "source", newTargets: true },
      },
    ],
  },
});
