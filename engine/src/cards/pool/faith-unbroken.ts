import { defineCard } from "../define.js";

// EDHREC rank 11377.
//
// Rulings:
//   [2016-07-13] The exiled card returns to the battlefield immediately after Faith Unbroken
//     leaves the battlefield. Nothing happens between the two events, including state-based
//     actions. However, if the creature Faith Unbroken enchants leaves the battlefield, Faith
//     Unbroken won't leave itself until state-based actions are checked.
//   [2016-07-13] If a token is exiled, it ceases to exist. It won't be returned to the
//     battlefield.
//   [2016-07-13] If Faith Unbroken leaves the battlefield before its triggered ability resolves,
//     the targeted creature won't be exiled.
//
// Dimensional Exile's trigger on an Aura for a creature you control.
const EXILE_TEXT =
  "When this Aura enters, exile target creature an opponent controls until this Aura leaves the battlefield.";

export default defineCard({
  name: "Faith Unbroken",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${EXILE_TEXT}\nEnchanted creature gets +2/+2.`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
