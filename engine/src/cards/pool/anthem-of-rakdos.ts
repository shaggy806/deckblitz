import { defineCard } from "../define.js";

// Dissension. EDHREC rank 21599.
//
// Rulings:
//   [2006-05-01] The first ability triggers once for each creature you attack with.
//   [2006-05-01] If a source you control would deal damage to multiple creatures and/or players
//     simultaneously, all of that damage is doubled.
//   [2006-05-01] The hellbent ability doubles the damage dealt to you by Anthem of Rakdos itself.

const ATTACK_TEXT =
  "Whenever a creature you control attacks, it gets +2/+0 until end of turn and this enchantment deals 1 damage to you.";
const HELLBENT_TEXT =
  "Hellbent — As long as you have no cards in hand, if a source you control would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.";

export default defineCard({
  name: "Anthem of Rakdos",
  manaCost: "{2}{B}{R}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${ATTACK_TEXT}\n${HELLBENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      replacement: { event: "would-deal-damage", multiplier: 2, source: { controlledBy: "you" } },
      text: HELLBENT_TEXT,
    },
  ],
});
