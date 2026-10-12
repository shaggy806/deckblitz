import { defineCard } from "../define.js";

// EDHREC rank 8358.
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
//   [2026-01-27] If Shark Shredder deals combat damage to a player during the first strike combat
//     damage step and its last ability returns a creature with first strike, the returned creature
//     will still deal combat damage during the regular combat damage step. If the returned
//     creature has double strike, it will deal combat damage only once during that regular combat
//     damage step.
//   [2026-01-27] In the case where Shark Shredder deals combat damage to a player during the
//     regular combat damage step (probably because another effect granted Shark Shredder double
//     strike), the creature returned with Shark Shredder's last ability won't deal combat damage
//     at all during that combat phase.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).

const DAMAGE_TEXT =
  "Whenever Shark Shredder deals combat damage to a player, put up to one target creature card from that player's graveyard onto the battlefield under your control. It enters tapped and attacking that player.";

// "Up to one target": with one chosen it goes, no further choice (the pick
// over the trigger's own targets is forced at min 1). It enters under your
// control, tapped and attacking the player who was dealt the damage, and
// unblocked (rule 508.4d) — after a first-strike hit it still deals its
// damage in the regular step (the rulings).
export default defineCard({
  name: "Shark Shredder, Killer Clone",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shark", "Octopus", "Ninja"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  sneak: { cost: "{3}{B}{B}" },
  text: `Sneak {3}{B}{B}\nFirst strike\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "trigger-player", filter: { type: "creature" } } },
      ],
      effect: {
        kind: "look-and-choose",
        zone: "targets",
        min: 1,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        enterTapped: true,
        attacking: { player: "trigger-player" },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
