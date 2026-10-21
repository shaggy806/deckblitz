import { defineCard } from "../define.js";

// EDHREC rank 28694.

export default defineCard({
  name: "Resplendent Griffin",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "ascend"],
  text: "Flying\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nWhenever this creature attacks, if you have the city's blessing, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, if you have the city's blessing, put a +1/+1 counter on it.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
