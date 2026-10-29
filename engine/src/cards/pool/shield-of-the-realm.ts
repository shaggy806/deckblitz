import { defineCard } from "../define.js";

// EDHREC rank 23286.
//
// Rulings:
//   If a creature is equipped with two Shields of the Realm, 4 damage will be prevented.
//   If multiple sources would deal damage to the equipped creature at once (for example,
//   several blocking creatures), 2 damage from each of those sources is prevented.
const PREVENT_TEXT = "If a source would deal damage to equipped creature, prevent 2 of that damage.";

export default defineCard({
  name: "Shield of the Realm",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PREVENT_TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", preventAmount: 2 },
      text: PREVENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
