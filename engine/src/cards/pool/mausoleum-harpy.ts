import { defineCard } from "../define.js";

// EDHREC rank 29406.

export default defineCard({
  name: "Mausoleum Harpy",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Harpy"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "ascend"],
  text: "Flying\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nWhenever another creature you control dies, if you have the city's blessing, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another creature you control dies, if you have the city's blessing, put a +1/+1 counter on this creature.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
