import { defineCard } from "../define.js";

// Makes Jace → use "Jace Token".

export default defineCard({
  name: "Protege's Awakening",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Empower Jace 6. (Put six loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "empower-jace", amount: 6 }, { kind: "draw", amount: 1 }],
  },
});
