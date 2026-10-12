import { defineCard } from "../define.js";

// EDHREC rank 10500.
//
// Rulings:
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.

const DAMAGE_TEXT =
  "Whenever Karai deals combat damage to a player, return target creature card from your graveyard to your hand. If her sneak cost was paid this turn, instead return that card to the battlefield.";

// "Her sneak cost was paid this turn": she was cast for it and entered this
// turn — read as the trigger resolves, as she last was if she has left.
export default defineCard({
  name: "Karai, Future of the Foot",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 3,
  toughness: 3,
  sneak: { cost: "{2}{W}{B}" },
  text: `Sneak {2}{W}{B} (You may cast this spell for {2}{W}{B} if you also return an unblocked attacker you control to hand during the declare blockers step. She enters tapped and attacking.)\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { castVia: "sneak", enteredThisTurn: true } },
        then: { kind: "put-onto-battlefield", target: 0 },
        else: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
