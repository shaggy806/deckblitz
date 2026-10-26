import { defineCard } from "../define.js";

// EDHREC rank 8750.
//
// Rulings:
//   [2004-10-04] It does not affect creatures which did not attack, but which are already tapped
//     at the time the ability resolves.
//   [2004-10-04] Angel's Trumpet affects creatures with Defender and other creatures that can't
//     attack for some reason.
//
// Monsoon's shape: the damage counts only the creatures this resolution
// tapped, so one already tapped isn't counted.

const VIGILANCE_TEXT = "All creatures have vigilance.";
const END_TEXT =
  "At the beginning of each player's end step, tap all untapped creatures that player controls that didn't attack this turn. This artifact deals damage to the player equal to the number of creatures tapped this way.";

export default defineCard({
  name: "Angel's Trumpet",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${VIGILANCE_TEXT}\n${END_TEXT}`,
  static: [{ affects: { scope: "all-creatures" }, grantKeywords: ["vigilance"], text: VIGILANCE_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "tap-all",
            filter: { type: "creature", controlledBy: "active-player", tapped: false, attackedThisTurn: false },
          },
          { kind: "damage", who: "active-player", amount: { thisWay: "tapped" } },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
