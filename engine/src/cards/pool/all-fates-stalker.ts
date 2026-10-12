import { defineCard } from "../define.js";

// EDHREC rank 11060.
//
// Rulings:
//   [2025-07-25] Auras attached to the exiled creature will be put into their owners’ graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled creature will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//   [2025-07-25] If a token is exiled this way, it will cease to exist and won’t return to the
//     battlefield.
//   [2025-07-25] If All-Fates Stalker leaves the battlefield before its first ability resolves,
//     the target creature won’t be exiled.
//   [2025-07-25] If you pay the warp cost to cast a spell, that permanent will be exiled only if
//     it’s still on the battlefield when that triggered ability resolves. If it goes to another
//     zone before then, it will stay where it is. If it goes to exile some other way, its owner
//     won’t be able to cast it on a future turn.
//   [2025-07-25] If you choose to pay a spell’s warp cost rather than its mana cost, you’re still
//     casting the spell. It goes on the stack and can be responded to and countered. You can cast
//     a spell for its warp cost only if you could cast that spell. Most of the time, this means
//     during your main phase while the stack is empty.
//
// Banishing Light's O-Ring on a non-Assassin creature (Werefox Bodyguard's
// shape). Warped, the Stalker is exiled at the next end step and the
// creature comes back then.

const ENTER_TEXT =
  "When this creature enters, exile up to one target non-Assassin creature until this creature leaves the battlefield.";

export default defineCard({
  name: "All-Fates Stalker",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Drix", "Assassin"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\nWarp {1}{W} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "permanent", filter: { type: "creature", notSubtypes: ["Assassin"] } } },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // The other half of the O-Ring (rule 610.3a — Banishing Light's shape).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
});
