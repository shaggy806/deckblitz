import { defineCard } from "../define.js";

export default defineCard({
  name: "Geistwave",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent to its owner's hand. If you controlled that permanent, draw a card.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        // Who controlled it as it last existed on the battlefield — as the
        // spell resolved, not at some earlier point (the ruling).
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { controlledBy: "you" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
