import { defineCard } from "../define.js";


export default defineCard({
  name: "Seven of Nine",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 4,
  text: "Whenever you face a dilemma, draw a card. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you face a dilemma, draw a card.",
    },
  ],
});
