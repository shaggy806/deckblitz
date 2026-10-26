import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] The loss of life is equal to Mortis Dogs's power as it last existed on the
//     battlefield.

export default defineCard({
  name: "Mortis Dogs",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dog"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, it gets +2/+0 until end of turn.\nWhen this creature dies, target player loses life equal to its power.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +2/+0 until end of turn.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player"],
      effect: { kind: "lose-life", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "When this creature dies, target player loses life equal to its power.",
    },
  ],
});
