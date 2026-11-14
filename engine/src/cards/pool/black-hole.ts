import { defineCard } from "../define.js";

// The number of Attractions you've visited this turn is counted as Black Hole
// is cast, to say how many targets it may have; they needn't still be on the
// battlefield (its ruling). Each is counted once however often it was visited.

export default defineCard({
  name: "Black Hole",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature and up to X other target creatures, where X is the number of Attractions you've visited this turn.",
  targets: [
    "creature",
    {
      kind: "any-number",
      of: { kind: "other", of: "creature", than: { slots: [0] } },
      max: { turnHistory: "visited" },
    },
  ],
  // One instruction: every target from slot 0 on, destroyed at once.
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
});
