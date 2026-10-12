import { defineCard } from "../define.js";

// EDHREC rank 7042.
//
// Rulings:
//   [2025-07-25] If multiple sources deal damage to a creature that has been granted the listed
//     ability by Requiem Monolith's ability (probably because multiple creatures blocked that
//     creature), the granted ability triggers only once. When it resolves, the creature's
//     controller draws cards and loses life equal to the total amount of damage dealt to that
//     creature by those sources.
//   [2025-07-25] If lethal damage is dealt to a creature that has been granted the listed ability
//     by Requiem Monolith's ability, the granted ability will still trigger.
//
// The granted ability is the creature's own, so its "you" is the creature's
// controller (Strength of Will's one-shot grant). The 1 damage is that
// player's choice (Star Athlete's `each-player-may` over the target's
// controller), dealt by the Monolith, after the grant — so it triggers it.

const GRANTED_TEXT = "Whenever this creature is dealt damage, you draw that many cards and lose that much life.";
const TEXT =
  `{T}: Until end of turn, target creature gains "${GRANTED_TEXT}" That creature's controller may have ` +
  "this artifact deal 1 damage to it. Activate only as a sorcery.";

export default defineCard({
  name: "Requiem Monolith",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "dealt-damage", who: "self" },
              targets: [],
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: { triggerValue: true } },
                  { kind: "lose-life", amount: { triggerValue: true } },
                ],
              },
              resolve: null,
              text: GRANTED_TEXT,
            },
          },
          {
            kind: "each-player-may",
            who: { controllerOfTarget: 0 },
            prompt: "Have Requiem Monolith deal 1 damage to your creature?",
            effect: { kind: "damage", amount: 1, target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
