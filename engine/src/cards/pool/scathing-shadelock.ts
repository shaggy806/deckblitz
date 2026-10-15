import { defineCard } from "../define.js";

// EDHREC rank 18057.

export default defineCard({
  name: "Scathing Shadelock",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake", "Warlock"],
  power: 4,
  toughness: 6,
  text: "At the beginning of your first main phase, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: "At the beginning of your first main phase, this creature becomes prepared.",
    },
  ],
  prepareSpell: "Venomous Words",
});
