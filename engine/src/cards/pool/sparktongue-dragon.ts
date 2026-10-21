import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you may pay {2}{R}. When you do, it deals 3 damage to any target.";

export default defineCard({
  name: "Sparktongue Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to have Sparktongue Dragon deal 3 damage to any target?",
        cost: "{2}{R}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: 3, target: 0 },
          text: "When you do, it deals 3 damage to any target.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
