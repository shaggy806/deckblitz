import { defineCard } from "../define.js";

export default defineCard({
  name: "Wild Wurm",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 4,
  text: "When this creature enters, flip a coin. If you lose the flip, return this creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "flip-coin", lost: { kind: "return-to-hand", target: "source" } },
      resolve: null,
      text: "When this creature enters, flip a coin. If you lose the flip, return this creature to its owner's hand.",
    },
  ],
});
