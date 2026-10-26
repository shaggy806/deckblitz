import { defineCard } from "../define.js";

// EDHREC rank 24861. Lethal Sting's additional cost: blight 1 is offered only
// with a creature to put the counter on (the ruling: no creature, no cast).

export default defineCard({
  name: "Scarscale Ritual",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, put a -1/-1 counter on a creature you control.\nDraw two cards.",
  additionalCost: {
    options: [{ text: "Put a -1/-1 counter on a creature you control", blight: 1 }],
  },
  targets: [],
  effect: { kind: "draw", amount: 2 },
});
