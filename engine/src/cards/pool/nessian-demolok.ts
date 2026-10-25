import { defineCard } from "../define.js";

// EDHREC rank 26511.

export default defineCard({
  name: "Nessian Demolok",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  tribute: 3,
  text: "Tribute 3 (As this creature enters, an opponent of your choice may put three +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, destroy target noncreature permanent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, destroy target noncreature permanent.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
