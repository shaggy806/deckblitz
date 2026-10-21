import { defineCard } from "../define.js";

// EDHREC rank 30163. Battlebond. "Your team" is "you" outside a team game
// (rule 102.4).
//
// Rulings:
//   [2018-06-08] Nimbus Champion's ability can target any creature. Whether that creature is
//     returned to its owner's hand is determined as the ability resolves.
// So the power check is a `conditional` read as it resolves, not a target
// filter.
const TEXT =
  "Whenever this creature attacks, you may return target creature to its owner's hand if that creature's power is less than or equal to the number of Warriors your team controls.";

export default defineCard({
  name: "Nimbus Champion",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Avatar", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: {
            power: { op: "lte", n: { amount: { countOf: { subtype: "Warrior", controlledBy: "you" } } } },
          },
        },
        then: {
          kind: "may",
          prompt: "Return target creature to its owner's hand?",
          effect: { kind: "return-to-hand", target: 0 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
