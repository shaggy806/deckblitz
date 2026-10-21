import { defineCard } from "../define.js";

// EDHREC rank 17837. Battlebond.
//
// Rulings:
//   [2018-06-08] Inner Demon's triggered ability affects only non-Demon creatures on the
//     battlefield at the time it resolves. Creatures that enter the battlefield later in the turn
//     won't get -2/-2. Unless Inner Demon leaves the battlefield before that ability resolves, the
//     enchanted creature won't get -2/-2.

export default defineCard({
  name: "Inner Demon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2, has flying, and is a Demon in addition to its other types.\nWhen this Aura enters, all non-Demon creatures get -2/-2 until end of turn.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", notSubtypes: ["Demon"] },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this Aura enters, all non-Demon creatures get -2/-2 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      addSubtypes: ["Demon"],
      text: "Enchanted creature gets +2/+2, has flying, and is a Demon in addition to its other types.",
    },
  ],
});
