import { defineCard } from "../define.js";

// EDHREC rank 17353.
//
// Rulings:
//   [2013-09-15] If Chained to the Rocks leaves the battlefield before its triggered ability
//     resolves, the target creature won't be exiled.
//   [2013-09-15] The exiled card returns to the battlefield immediately after Chained to the Rocks
//     leaves the battlefield. Nothing happens between the two events, including state-based
//     actions.
//   [2013-09-15] Auras attached to the exiled creature will be put into their owners' graveyards
//     (unless they have bestow). Equipment attached to the exiled creature will become unattached
//     and remain on the battlefield. Any counters on the exiled creature will cease to exist.
//   [2013-09-15] If a creature token is exiled, it ceases to exist. It won't be returned to the
//     battlefield.
//   [2013-09-15] If the land Chained to the Rocks is enchanting stops being a Mountain or another
//     player gains control of it, Chained to the Rocks will be put into its owner's graveyard when
//     state-based actions are performed.

const EXILE_TEXT =
  "When this Aura enters, exile target creature an opponent controls until this Aura leaves the battlefield. (That creature returns under its owner's control.)";

// Dimensional Exile's shape, enchanting a Mountain you control.
export default defineCard({
  name: "Chained to the Rocks",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Mountain you control\n${EXILE_TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Mountain" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
