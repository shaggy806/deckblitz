import { defineCard } from "../define.js";

// EDHREC rank 25289.

export default defineCard({
  name: "Pharagax Giant",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 3,
  tribute: 2,
  text: "Tribute 2 (As this creature enters, an opponent of your choice may put two +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, this creature deals 5 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 5, who: "each-opponent" },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, this creature deals 5 damage to each opponent.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
