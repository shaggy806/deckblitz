import { defineCard } from "../define.js";

// Magic 2011 (M11). EDHREC rank 5162.
//
// Rulings:
//   [2010-08-15] If Angelic Arbiter enters during an opponent's turn, its abilities take actions
//     that player performed earlier in the turn into account, even though it wasn't on the
//     battlefield at the time.
//   [2010-08-15] If Angelic Arbiter leaves the battlefield during an opponent's turn, its
//     abilities cease to affect the game.
//   [2010-08-15] During an opponent's turn, that opponent may either cast spells or attack with
//     creatures, but not both. The player may perform other actions, such as activating
//     abilities and playing lands.
//
// Each opponent is asked for themselves: what one opponent did binds nobody else.

const NO_ATTACK_TEXT = "Each opponent who cast a spell this turn can't attack with creatures.";
const NO_CAST_TEXT = "Each opponent who attacked with a creature this turn can't cast spells.";

export default defineCard({
  name: "Angelic Arbiter",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${NO_ATTACK_TEXT}\n${NO_CAST_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "opponent", controllerThisTurn: { stat: "spells-cast" } },
      },
      restrictions: ["cant-attack"],
      text: NO_ATTACK_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: { who: "opponents", thisTurn: { stat: "attacked" } } }],
      text: NO_CAST_TEXT,
    },
  ],
});
