import { defineCard } from "../define.js";

// EDHREC rank 31130. "Was" reads the creature as it last existed if it has
// gone (rule 608.2h).

export default defineCard({
  name: "Gloomlance",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. If that creature was green or white, its controller discards a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["G"] }, { colors: ["W"] }] } },
        then: { kind: "discard", target: { controllerOfTarget: 0 }, amount: 1 },
      },
    ],
  },
});
