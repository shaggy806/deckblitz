import { defineCard } from "../define.js";

// EDHREC rank 22635. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] If you pay the blitz cost to cast a creature spell, that permanent will be
//     sacrificed only if it's still on the battlefield when that triggered ability resolves.
//   [2022-04-29] The triggered ability that lets its controller draw a card triggers when it dies
//     for any reason, not just when you sacrifice it during the end step.
const ATTACK_TEXT = "Whenever this creature attacks, target creature an opponent controls can't block this turn.";
const BLITZ_TEXT =
  'Blitz {2}{R} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Plasma Jockey",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 3,
  toughness: 1,
  text: `${ATTACK_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{2}{R}" },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
