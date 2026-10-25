import { defineCard } from "../define.js";

// EDHREC rank 15752.

export default defineCard({
  name: "Destructor Dragon",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, destroy target noncreature permanent.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature dies, destroy target noncreature permanent.",
    },
  ],
});
