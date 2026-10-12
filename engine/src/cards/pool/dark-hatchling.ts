import { defineCard } from "../define.js";

export default defineCard({
  name: "Dark Hatchling",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, destroy target nonblack creature. It can't be regenerated.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature enters, destroy target nonblack creature. It can't be regenerated.",
    },
  ],
});
