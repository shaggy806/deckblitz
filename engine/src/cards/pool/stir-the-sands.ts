import { defineCard } from "../define.js";

// Amonkhet. The cycle trigger resolves before the cycling draw (the ruling).
const CYCLED = "When you cycle this card, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Stir the Sands",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{3}{B}" },
  text: `Create three 2/2 black Zombie creature tokens.\nCycling {3}{B} ({3}{B}, Discard this card: Draw a card.)\n${CYCLED}`,
  effect: { kind: "create-token", token: "Zombie Token", count: 3 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: CYCLED,
    },
  ],
});
