import { defineCard } from "../define.js";

export default defineCard({
  name: "Specter of the Fens",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{5}{B}: Target opponent loses 2 life and you gain 2 life.",
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "{5}{B}: Target opponent loses 2 life and you gain 2 life.",
    },
  ],
});
