import { defineCard } from "../define.js";

export default defineCard({
  name: "Glen Elendra Pranksters",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast a spell during an opponent's turn, you may return target creature you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: ["creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Return the target creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "Whenever you cast a spell during an opponent's turn, you may return target creature you control to its owner's hand.",
    },
  ],
});
