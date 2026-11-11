import { defineCard } from "../define.js";

// EDHREC rank 5355.
//
// Rulings:
//   [2026-03-06] The token copies will have Shredder's abilities.
//   [2026-03-06] Although the token copies created by Shredder's first ability enter attacking,
//     they were never declared as attacking creatures.
//   [2026-03-06] If Shredder leaves the battlefield before his last ability resolves, the tokens
//     will still enter as a copy of Shredder, using Shredder's copiable values from when he was
//     last on the battlefield.
//
// One token for each opponent other than the player attacked, attacking that
// opponent (myriad's shape, not optional, sacrificed rather than exiled).
const ATTACK_TEXT =
  "Whenever Shredder attacks a player, for each other opponent, create a token that's a copy of Shredder tapped and attacking that player, except it isn't legendary. Sacrifice those tokens at end of combat.";
const DAMAGE_TEXT = "Whenever Shredder deals combat damage to a player, that player loses half their life, rounded up.";

export default defineCard({
  name: "Shredder, Shadow Master",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 5,
  toughness: 5,
  text: `${ATTACK_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", attackedPlayer: "any" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-other-opponent",
        effect: {
          kind: "create-token-copy",
          of: "source",
          count: 1,
          tapped: true,
          attacking: { player: "that-player" },
          sacrificeAtEndOfCombat: true,
          exceptions: { removeSupertypes: ["legendary"] },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
