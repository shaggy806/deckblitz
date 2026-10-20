import { defineCard } from "../define.js";

// EDHREC rank 7412.
//
// Rulings:
//   Its second ability counts the total amount of life gained this turn without taking into
//   account any life you lost during that turn.

export default defineCard({
  name: "Accomplished Alchemist",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 5,
  text: "{T}: Add one mana of any color.\n{T}: Add X mana of any one color, where X is the amount of life you gained this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      // The life gained this turn, not net of life lost (the ruling).
      effect: { kind: "add-mana", mana: "any-color", amount: { turnStat: "life-gained", who: "you" } },
      resolve: null,
      text: "{T}: Add X mana of any one color, where X is the amount of life you gained this turn.",
    },
  ],
});
