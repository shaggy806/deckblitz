import { defineCard } from "../define.js";

// EDHREC rank 694.

export default defineCard({
  name: "Purphoros, God of the Forge",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to red is less than five, Purphoros isn't a creature.\nWhenever another creature you control enters, Purphoros deals 2 damage to each opponent.\n{2}{R}: Creatures you control get +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{R}: Creatures you control get +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "Whenever another creature you control enters, Purphoros deals 2 damage to each opponent.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["R"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to red is less than five, Purphoros isn't a creature.",
    },
  ],
});
