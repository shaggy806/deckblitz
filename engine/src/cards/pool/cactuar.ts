import { defineCard } from "../define.js";

// EDHREC rank 17760.
//
// Fleeting Effigy's end-step bounce behind an intervening "if" (rule 603.4),
// asked as it triggers and again as it resolves: the `source` condition
// `enteredThisTurn: false`.

const END_TEXT =
  "At the beginning of your end step, if this creature didn't enter the battlefield this turn, return it to its owner's hand.";

export default defineCard({
  name: "Cactuar",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { enteredThisTurn: false } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
