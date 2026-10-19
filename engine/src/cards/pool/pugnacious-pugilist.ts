import { defineCard } from "../define.js";

// "Tapped and attacking" names no player, so its controller chooses which
// player or planeswalker the Devil attacks (rule 508.4).
const ATTACK_TEXT =
  'Whenever this creature attacks, create a tapped and attacking 1/1 red Devil creature token with "When this token dies, it deals 1 damage to any target."';
const BLITZ_TEXT =
  'Blitz {3}{R} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Pugnacious Pugilist",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{3}{R}" },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Devil Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
