import { defineCard } from "../define.js";

export default defineCard({
  name: "Temporal Machinations",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target creature to its owner's hand. If you control an artifact, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      // Checked after the bounce (the ruling).
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
