import { defineCard } from "../define.js";

const TEXT = "At the beginning of your end step, if you discarded a card this turn, transform this creature.";

export default defineCard({
  name: "Ragged Recluse",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "discarded" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Ragged Recluse", "Odious Witch"],
  transform: true,
});
