import { defineCard } from "../define.js";

// Rulings:
//   [2018-03-16] You get the token created by Skeletonize's delayed triggered ability regardless
//     of who controlled the creature.
//
// "A creature dealt damage this way": the delayed trigger is set up only if the 3 damage was
// actually dealt (none of it prevented), and it watches that creature dying this turn.

const DIES_TEXT =
  "When a creature dealt damage this way dies this turn, create a 1/1 black Skeleton creature token with \"{B}: Regenerate this token.\"";

export default defineCard({
  name: "Skeletonize",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Skeletonize deals 3 damage to target creature. ${DIES_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "damage-dealt-this-way", to: 0 },
        then: {
          kind: "delayed-trigger",
          at: { leaves: 0, to: ["graveyard"], thisTurn: true },
          effect: { kind: "create-token", token: "Skeleton Regenerating Token", count: 1 },
          text: DIES_TEXT,
        },
      },
    ],
  },
});
