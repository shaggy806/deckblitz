import { defineCard } from "../define.js";

// EDHREC rank 13058.
//
// Rulings:
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).
//   [2026-01-27] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Auras attached to the exiled creature will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled creature will cease to exist. If the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//   [2026-01-27] If Turncoat Kunoichi's sneak cost wasn't paid and it leaves the battlefield
//     before its triggered ability resolves, the target creature won't be exiled.
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.

const ENTER_TEXT =
  "When this creature enters, choose target creature an opponent controls. Exile that creature until this creature leaves the battlefield. If this creature's sneak cost was paid, instead exile the chosen creature.";

// Without sneak, Banishing Light's O-Ring (with its return half below): if
// this creature has left before the trigger resolves, nothing is exiled (the
// ruling). With sneak paid, the exile is for good — the return finds nothing
// of this creature's to bring back.
export default defineCard({
  name: "Turncoat Kunoichi",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Fox"],
  power: 3,
  toughness: 2,
  sneak: { cost: "{2}{W}{B}" },
  text: `Sneak {2}{W}{B} (You may cast this spell for {2}{W}{B} if you also return an unblocked attacker you control to hand during the declare blockers step. It enters tapped and attacking.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { castVia: "sneak" } },
        then: { kind: "exile", target: 0 },
        else: { kind: "exile", target: 0, untilSourceLeaves: true },
      },
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
