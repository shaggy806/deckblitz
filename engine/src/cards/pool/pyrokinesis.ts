import { defineCard } from "../define.js";

// EDHREC rank 5270.
//
// Rulings:
//   [2016-06-08] If another effect causes Pyrokinesis to cost more, you must pay that additional
//     cost even if you pay its alternative cost.
//   [2016-06-08] Each target must be assigned at least 1 damage.
//   [2016-06-08] You divide the damage as you cast Pyrokinesis, not as it resolves. If any of the
//     targets become illegal, damage is dealt to the other targets as originally assigned. If all
//     targets are illegal, Pyrokinesis doesn’t resolve.

export default defineCard({
  name: "Pyrokinesis",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may exile a red card from your hand rather than pay this spell's mana cost.\nPyrokinesis deals 4 damage divided as you choose among any number of target creatures.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["R"] }, text: "a red card" } },
  targets: [{ kind: "any-number", of: "creature", max: 4 }],
  divided: { total: 4, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
