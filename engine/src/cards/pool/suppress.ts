import { defineCard } from "../define.js";

// The delayed ability stays the caster's (rule 603.7d); "that player's next
// turn" is only when it fires.

export default defineCard({
  name: "Suppress",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player exiles all cards from their hand face down. At the beginning of the end step of that player's next turn, that player returns those cards to their hand.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: 0, fromHand: "only", faceDown: true },
      {
        kind: "delayed-trigger",
        at: { step: "end", whose: { target: 0 }, which: "next-turn" },
        about: "exiled",
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: { kind: "return-to-hand", target: 0, from: "exile" },
        },
        text: "That player returns those cards to their hand.",
      },
    ],
  },
});
