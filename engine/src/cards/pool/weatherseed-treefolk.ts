import { defineCard } from "../define.js";

export default defineCard({
  name: "Weatherseed Treefolk",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhen this creature dies, return it to its owner's hand.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: "When this creature dies, return it to its owner's hand.",
    },
  ],
});
