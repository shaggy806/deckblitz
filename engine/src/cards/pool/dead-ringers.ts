import { defineCard } from "../define.js";

// EDHREC rank 29326. The colors are compared as the spell resolves (its
// ruling): exactly the same color or colors, both colorless included, or it
// does nothing. A target gone illegal by then can't be asked its colors, and
// the part of the effect that needs them won't happen (rule 608.2b): neither
// is destroyed.

const TEXT =
  "Destroy two target nonblack creatures unless either one is a color the other isn't. They can't be regenerated.";

export default defineCard({
  name: "Dead Ringers",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["nonblack-creature", { kind: "other", of: "nonblack-creature", than: { slot: 0 } }],
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "target-legal", index: 1 },
        { kind: "target", index: 0, filter: { sameColorsAs: 1 } },
      ],
    },
    then: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "destroy", target: 0, cantBeRegenerated: true },
        { kind: "destroy", target: 1, cantBeRegenerated: true },
      ],
    },
  },
});
