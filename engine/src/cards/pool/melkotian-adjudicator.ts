import { defineCard } from "../define.js";


export default defineCard({
  name: "Melkotian Adjudicator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Melkotian", "Advisor"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nWhenever you face a dilemma, put a +1/+1 counter on this creature. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you face a dilemma, put a +1/+1 counter on this creature.",
    },
  ],
});
