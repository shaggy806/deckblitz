import { defineCard } from "../define.js";


export default defineCard({
  name: "Elim Garak, Simple Tailor",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cardassian", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nWhenever you face a dilemma, each opponent loses 2 life and you gain 2 life. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: "Whenever you face a dilemma, each opponent loses 2 life and you gain 2 life.",
    },
  ],
});
