import { defineCard } from "../define.js";

const TEXT = "When this creature enters, it deals X damage to any target, where X is the greatest number of creatures you control that have a creature type in common.";

// Read as the ability resolves, itself included if it's still yours (the ruling).
export default defineCard({
  name: "Basalt Ravager",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "damage",
        target: 0,
        amount: { aggregate: "greatest-shared-creature-type", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
