import { defineCard } from "../define.js";

// EDHREC rank 1703. The tokens copied are fixed as the end step's ability
// resolves (`create-token-copy`'s `{ each }`, rule 608.2h), so a copy made
// here isn't copied too, and each token entered this turn on its own count
// (a stack once per token). Each is copied as the effect that made it said,
// a copy of a copy as what it copied (rule 707.2, the rulings). A source
// that has left reads its last choice, as `ofChosenType` does everywhere.

const CHOOSE = "As this enchantment enters, choose a creature type.";
const ANTHEM = "Creatures you control of the chosen type get +1/+0.";
const END_STEP =
  "At the beginning of your end step, for each token you control of the chosen type that entered this turn, create a token that's a copy of it.";

export default defineCard({
  name: "Renewed Solidarity",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE}\n${ANTHEM}\n${END_STEP}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true } },
      grantPt: [1, 0],
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: { each: { token: true, controlledBy: "you", enteredThisTurn: true, ofChosenType: true } },
        count: 1,
      },
      resolve: null,
      text: END_STEP,
    },
  ],
});
