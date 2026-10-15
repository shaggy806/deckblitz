import { defineCard } from "../define.js";

// EDHREC rank 18062. "Then if that creature's power is 0 or less" is asked
// of it after the -3/-0 applies, in the same resolution.

export default defineCard({
  name: "Depressurize",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -3/-0 until end of turn. Then if that creature's power is 0 or less, destroy it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { power: { op: "lte", n: 0 } } },
        then: { kind: "destroy", target: 0 },
      },
    ],
  },
});
