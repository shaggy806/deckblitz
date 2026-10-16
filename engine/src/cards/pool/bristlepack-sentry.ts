import { defineCard } from "../define.js";

// EDHREC rank 20525. Ruling: its own power counts ("if you raise Bristlepack
// Sentry's power to 4 or greater, it fulfills its own condition") — hence
// `countsSelf`. Once it has attacked, losing the condition doesn't remove it
// from combat (defender is only checked as attackers are declared).
const ATTACK_TEXT =
  "As long as you control a creature with power 4 or greater, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Bristlepack Sentry",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wolf"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
        countsSelf: true,
      },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
