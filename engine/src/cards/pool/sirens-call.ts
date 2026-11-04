import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_ANY_TURN } from "../helpers.js";

// EDHREC rank 22033.
//
// Rulings:
//   The creature is destroyed if it does not attack because it simply can't do so legally.
//   It will require creatures with Haste to attack since they are able, but it won't destroy them
//   if they don't for some reason.
//   This will destroy creatures that weren't able to attack because they had been previously
//   tapped.
//   If a turn has multiple combat phases, this spell can only be cast before the beginning of the
//   Declare Attackers Step of the first combat phase in that turn.
//
// "Attack this turn if able" changes the rules rather than any object (rule
// 611.2c), so it reaches a creature that arrives later. "That player" is the
// active player as it resolves, fixed then (`controlledByAsSetUp`): if the turn
// is ended, the next end step is another player's (rule 724). "This turn" and
// "the beginning of the turn" are the turn the delayed ability resolves on.

export default defineCard({
  name: "Siren's Call",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cast this spell only during an opponent's turn, before attackers are declared.\nCreatures the active player controls attack this turn if able.\nAt the beginning of the next end step, destroy all non-Wall creatures that player controls that didn't attack this turn. Ignore this effect for each creature the player didn't control continuously since the beginning of the turn.",
  castOnlyIf: { kind: "all", of: [{ kind: "not", of: { kind: "your-turn" } }, BEFORE_ATTACKERS_ANY_TURN] },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "active-player" },
        restrictions: ["must-attack"],
      },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        text: "Destroy all non-Wall creatures that player controls that didn't attack this turn.",
        effect: {
          kind: "destroy-all",
          filter: {
            type: "creature",
            notSubtypes: ["Wall"],
            controlledByAsSetUp: "active-player",
            controlledSinceTurnBegan: true,
            attackedThisTurn: false,
          },
        },
      },
    ],
  },
});
