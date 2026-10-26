import { defineCard } from "../define.js";

// EDHREC rank 26734.
//
// Rulings:
//   [2008-10-01] If there are no other creatures on the battlefield, Fire Dragon will have to
//     target itself. The ability is mandatory.

const TEXT = "When this creature enters, it deals damage to target creature equal to the number of Mountains you control.";

export default defineCard({
  name: "Fire Dragon",
  manaCost: "{6}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
