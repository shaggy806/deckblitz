import { defineCard } from "../define.js";

export default defineCard({
  name: "Whoosh!",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nReturn target nonland permanent to its owner's hand. If this spell was kicked, draw a card.",
  // Into the Roil's text, word for word.
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  kicker: {
    cost: "{1}{U}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0 },
        { kind: "draw", amount: 1 },
      ],
    },
  },
});
