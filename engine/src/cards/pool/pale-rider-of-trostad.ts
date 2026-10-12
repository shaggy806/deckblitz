import { defineCard } from "../define.js";

export default defineCard({
  name: "Pale Rider of Trostad",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["skulk"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nWhen this creature enters, discard a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "you", amount: 1 },
      resolve: null,
      text: "When this creature enters, discard a card.",
    },
  ],
});
