import { defineCard } from "../define.js";

export default defineCard({
  name: "Baleful Force",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  text: "At the beginning of each upkeep, you draw a card and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "At the beginning of each upkeep, you draw a card and you lose 1 life.",
    },
  ],
});
