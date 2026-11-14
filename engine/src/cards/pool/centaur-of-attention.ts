import { defineCard } from "../define.js";

// Rulings:
//   [2022-10-07] The value of X is the largest number of dice that match, not what number
//     they're showing: 1, 1, 3, 3 and 4 give +2/+2.
//   [2022-10-07] To reroll a noted result, roll a die with the same number of sides and replace
//     the noted result with the new result.
//   [2022-10-07] You may reroll any results stored on it, even those you chose not to reroll
//     on previous turns.
//   [2022-10-07] If its enters ability is copied or triggers more than once, more than five
//     results can be stored; the last ability considers all of them.
//   [2022-10-07] Anything that references the "result" of a die roll looks at the result after
//     modifications.

const ENTERS_TEXT = "When this creature enters, roll five six-sided dice and store those results on it.";
const COMBAT_TEXT = "At the beginning of combat on your turn, you may reroll any number of this creature's stored results.";
const STATIC_TEXT = "This creature gets +X/+X, where X is the greatest number of stored results on it of the same value.";

export default defineCard({
  name: "Centaur of Attention",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Performer"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${COMBAT_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "roll-dice", sides: 6, count: 5, storeResults: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      // "Any number" includes none: the choice is the "may".
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "reroll-stored-results" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { ofAffected: "most-alike-stored-results", pt: [1, 1] },
      text: STATIC_TEXT,
    },
  ],
});
