import { defineCard } from "../define.js";


export default defineCard({
  name: "Obsidian Order Operative",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cardassian", "Officer", "Spy"],
  power: 2,
  toughness: 5,
  text: "Whenever you face a dilemma, each opponent loses 1 life and you gain 1 life. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you face a dilemma, each opponent loses 1 life and you gain 1 life.",
    },
  ],
});
