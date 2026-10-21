import { defineCard } from "../define.js";

// EDHREC rank 21521.
//
// Rulings:
//   [2019-06-14] Effects that modify Bogardan Dragonheart's power or toughness (such as the
//     effects of Force of Virtue or Giant Growth) will apply no matter when they started to take
//     effect. The same is true for counters that change its power or toughness (such as +1/+1
//     counters).
//   [2019-06-14] Bogardan Dragonheart doesn't lose any abilities when it becomes a Dragon.
//   [2019-06-14] Bogardan Dragonheart's ability overwrites all previous effects that set its
//     creature types, power, and/or toughness to specific values. Other effects that set these
//     characteristics to specific values that start to apply after the ability resolves will
//     overwrite that part of this effect.
// Mordenkainen's Polymorph's shape: base P/T in layer 7b, its creature types
// set to Dragon.

const TEXT =
  "Sacrifice another creature: Until end of turn, this creature becomes a Dragon with base power and toughness 4/4, flying, and haste.";

export default defineCard({
  name: "Bogardan Dragonheart",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Dragon"],
        keywords: ["flying", "haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
