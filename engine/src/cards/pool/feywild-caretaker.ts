import { defineCard } from "../define.js";

// EDHREC rank 9515.
// Makes Faerie Dragon → use "Faerie Dragon Token".

export default defineCard({
  name: "Feywild Caretaker",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Orc", "Wizard"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, you take the initiative.\nAt the beginning of your end step, if you have the initiative, create a 1/1 blue Faerie Dragon creature token with flying.",
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
      effect: { kind: "create-token", token: "Faerie Dragon Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you have the initiative, create a 1/1 blue Faerie Dragon creature token with flying.",
      condition: { kind: "initiative", who: "you" },
    },
  ],
});
