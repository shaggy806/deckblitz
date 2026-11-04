import { defineCard } from "../define.js";

// One slot over any spell or a creature permanent (`one-of`). Of the two
// returns, only the one from the zone the target is in does anything. A spell
// returned isn't countered, so it works on one that can't be (the ruling).
export default defineCard({
  name: "Unsubstantiate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target spell or creature to its owner's hand.",
  targets: [{ kind: "one-of", of: ["spell", "creature"] }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "stack" },
      { kind: "return-to-hand", target: 0 },
    ],
  },
});
