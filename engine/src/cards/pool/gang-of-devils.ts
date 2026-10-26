import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 28191.
//
// Rulings:
//   [2012-05-01] You divide the damage as you put Gang of Devils's triggered ability on the stack,
//     not as it resolves. Each target must be assigned at least 1 damage.
//
// Gandalf, Spark Starter's shape on a dies trigger.

const TEXT = "When this creature dies, it deals 3 damage divided as you choose among one, two, or three targets.";

export default defineCard({
  name: "Gang of Devils",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
      divided: { total: 3, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
