import { defineCard } from "../define.js";

// EDHREC rank 16027.

export default defineCard({
  name: "Avenging Hunter",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon", "Ranger"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, you take the initiative.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
  ],
});
