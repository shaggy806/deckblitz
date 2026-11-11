import { defineCard } from "../define.js";

// EDHREC rank 6290.
//
// Rulings:
//   [2017-09-29] The control-change effect of Admiral Beckett Brass's triggered ability lasts
//     indefinitely. It doesn't wear off during the cleanup step or when you lose control of
//     Admiral Beckett Brass.
//   [2017-09-29] If more than one player was dealt combat damage by three Pirates, you target only
//     one permanent. It may be controlled by either of those players.
//   [2017-09-29] If one Pirate deals combat damage multiple times, most likely because it has
//     double strike, it counts as only one of the three Pirates for Admiral Beckett Brass's
//     triggered ability.
//   [2017-09-29] In a multiplayer game, if a player leaves the game, all cards that player owns
//     leave as well, and any effects that give the player control of permanents immediately end.
//   [2017-09-29] Admiral Beckett Brass's triggered ability checks what happened earlier in the
//     turn. It doesn't care whether Admiral Beckett Brass was on the battlefield when those
//     Pirates dealt combat damage, whether those creatures are still on the battlefield, or
//     whether they're still Pirates.
//   [2017-09-29] In a Two-Headed Giant game, combat damage dealt by Pirates your teammate controls
//     will count when checking for Admiral Beckett Brass's ability.

export default defineCard({
  name: "Admiral Beckett Brass",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  text: "Other Pirates you control get +1/+1.\nAt the beginning of your end step, gain control of target nonland permanent controlled by a player who was dealt combat damage by three or more Pirates this turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // The Pirates are whoever's: each counted once for a player however
      // often it dealt them combat damage, as it was then (the journal).
      targets: [
        {
          kind: "permanent",
          filter: {
            notTypes: ["land"],
            controllerTurnHistory: { what: "combat-damaged-by", filter: { subtype: "Pirate" }, atLeast: 3 },
          },
        },
      ],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: "At the beginning of your end step, gain control of target nonland permanent controlled by a player who was dealt combat damage by three or more Pirates this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Pirate" },
      grantPt: [1, 1],
      text: "Other Pirates you control get +1/+1.",
    },
  ],
});
