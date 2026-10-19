import { defineCard } from "../define.js";

// EDHREC rank 11466.

export default defineCard({
  name: "Passageway Seer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Tiefling", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: "Lifelink\nWhen this creature enters, you take the initiative.\nAt the beginning of your end step, if you have the initiative, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you have the initiative, put a +1/+1 counter on this creature.",
      condition: { kind: "initiative", who: "you" },
    },
  ],
});
