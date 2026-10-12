import { defineCard } from "../define.js";

export default defineCard({
  name: "Blight Keeper",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat", "Imp"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{7}{B}, {T}, Sacrifice this creature: Target opponent loses 4 life and you gain 4 life.",
  activated: [
    {
      cost: { mana: "{7}{B}", tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
      },
      resolve: null,
      text: "{7}{B}, {T}, Sacrifice this creature: Target opponent loses 4 life and you gain 4 life.",
    },
  ],
});
