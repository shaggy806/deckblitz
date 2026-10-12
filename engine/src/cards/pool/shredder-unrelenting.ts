import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 13757.
//
// Rulings:
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).

const TRIGGER_TEXT = "Whenever Shredder enters or attacks, another target creature you control gains deathtouch until end of turn.";

const DEATHTOUCH_GRANT: EffectSpec = { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" };

export default defineCard({
  name: "Shredder, Unrelenting",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 6,
  toughness: 4,
  keywords: ["deathtouch"],
  sneak: { cost: "{3}{B}" },
  text: `Sneak {3}{B} (You may cast this spell for {3}{B} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\nDeathtouch\n${TRIGGER_TEXT}`,
  // "Enters or attacks" is two triggers. Entering tapped and attacking with
  // sneak isn't attacking (the ruling): only the enters one fires then.
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: DEATHTOUCH_GRANT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: DEATHTOUCH_GRANT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
