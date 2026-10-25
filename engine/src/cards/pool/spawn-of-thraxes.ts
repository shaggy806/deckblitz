import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, it deals damage to any target equal to the number of Mountains you control.";

export default defineCard({
  name: "Spawn of Thraxes",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
