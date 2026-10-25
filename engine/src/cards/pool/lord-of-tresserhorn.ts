import { defineCard } from "../define.js";

// EDHREC rank 21624.
//
// Rulings:
//   [2004-10-04] Since this is a loss of life and not a payment, your life total can be reduced
//     below zero by this.
//   [2004-10-04] When Lord of Tresserhorn enters, if you have zero or one other creature on the
//     battlefield, Lord of Tresserhorn itself will be sacrificed as part of its ability's effect.
//     Regeneration won't save it. The rest of the effect still happens.

export default defineCard({
  name: "Lord of Tresserhorn",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 10,
  toughness: 4,
  text: "When Lord of Tresserhorn enters, you lose 2 life, you sacrifice two creatures, and target opponent draws two cards.\n{B}: Regenerate Lord of Tresserhorn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate Lord of Tresserhorn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2 },
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 2 },
          { kind: "draw", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: "When Lord of Tresserhorn enters, you lose 2 life, you sacrifice two creatures, and target opponent draws two cards.",
    },
  ],
});
