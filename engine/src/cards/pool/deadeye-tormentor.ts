import { defineCard } from "../define.js";

export default defineCard({
  name: "Deadeye Tormentor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Raid — When this creature enters, if you attacked this turn, target opponent discards a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, target opponent discards a card.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
