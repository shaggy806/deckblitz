import { defineCard } from "../define.js";

// EDHREC rank 21936. Edge of Eternities.
//
// Demon Wall's conditional "can attack as though it didn't have defender",
// on a `turn-history` "entered" condition — "an artifact entered" asks what
// entered, so each permanent is matched as it entered (its `asEntered`
// snapshot): one that has since stopped being an artifact, or left, still
// counts, and one that became an artifact later doesn't. "An artifact"
// includes this one, the turn it enters.

const ATTACK_TEXT =
  "As long as an artifact entered the battlefield under your control this turn, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Mechan Shieldmate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
