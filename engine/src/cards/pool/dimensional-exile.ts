import { defineCard } from "../define.js";

// EDHREC rank 16740.
//
// Rulings:
//   [2026-01-27] Auras attached to the exiled creature will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled creature will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//   [2026-01-27] If Dimensional Exile leaves the battlefield before its triggered ability
//     resolves, the target creature won't be exiled.
//   [2026-01-27] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.


const EXILE_TEXT =
  "When this Aura enters, exile target creature an opponent controls until this Aura leaves the battlefield.";

// Ossification's shape, creatures only: if the Aura has left before the
// trigger resolves nothing is exiled (the ruling), and a token exiled ceases
// to exist and doesn't come back.
export default defineCard({
  name: "Dimensional Exile",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant basic land you control\n${EXILE_TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "land", supertype: "basic" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this Aura leaves the battlefield, return the exiled card.",
    },
  ],
});
