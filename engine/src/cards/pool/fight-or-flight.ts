import { defineCard } from "../define.js";

// Rulings:
//   The effect is best understood if you read it as "creatures not in the chosen pile can't
//   attack."
//   Creatures which enter (or cards which become creatures) after the beginning of combat ability
//   resolves are not placed in either pile. Since they weren't in the chosen pile, they won't be
//   able to attack.
//   If you have two of these, then you will separate the creatures into piles twice, and the
//   opponent will choose a pile each time. Only creatures that were in both of the chosen piles
//   can attack.
//
// The chosen pile's fate is a turn-wide restriction over every creature that player controls
// but the pile's (`exceptTargets`), so a later arrival can't attack either; `always` applies it
// to an empty pile too (rule 700.3d).

const TEXT =
  "At the beginning of combat on each opponent's turn, separate all creatures that player controls into two piles. Only creatures in the pile of their choice can attack this turn.";

export default defineCard({
  name: "Fight or Flight",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "opponent" },
      targets: [],
      effect: {
        kind: "separate-into-piles",
        objects: { permanents: { type: "creature" }, whose: "active-player" },
        chooser: "active-player",
        chosen: {
          together: {
            kind: "restrict",
            filter: { type: "creature", controlledBy: "you" },
            sideOf: "active-player",
            exceptTargets: true,
            restrictions: ["cant-attack"],
          },
          word: "can-attack",
          always: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
