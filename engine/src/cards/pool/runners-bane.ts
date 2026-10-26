import { defineCard } from "../define.js";

// EDHREC rank 29347.
//
// Rulings:
//   [2013-04-15] The enchanted creature can still be untapped in other ways, such as by Aurelia,
//     the Warleader.
//   [2013-04-15] If the enchanted creature's power increases to 4 or greater, Runner's Bane will
//     be put into its owner's graveyard as a state-based action.
//
// Roots' shape: "Enchant creature with power 3 or less" is the Aura's target filter, which the
// state-based check also reads (704.5m) — the second ruling.

export default defineCard({
  name: "Runner's Bane",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature with power 3 or less\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
