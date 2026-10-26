import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature you control with power 5 or greater enters, you may have this enchantment deal 5 damage to any target.";

export default defineCard({
  name: "Where Ancients Tread",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 5 } },
      },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have Where Ancients Tread deal 5 damage to the target?",
        effect: { kind: "damage", amount: 5, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
