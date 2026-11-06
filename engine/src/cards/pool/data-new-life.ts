import { defineCard } from "../define.js";

// EDHREC rank 28458.

export default defineCard({
  name: "Data, New Life",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Android", "Scientist"],
  power: 0,
  toughness: 1,
  text: "Whenever you draw a card, put a +1/+1 counter on Data.",
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you draw a card, put a +1/+1 counter on Data.",
    },
  ],
});
