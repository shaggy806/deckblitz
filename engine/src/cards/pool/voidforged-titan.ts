import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 17354.
const VOID_TEXT =
  "Void — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, you draw a card and lose 1 life.";

export default defineCard({
  name: "Voidforged Titan",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Warrior"],
  power: 5,
  toughness: 4,
  text: VOID_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: VOID_CONDITION,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: VOID_TEXT,
    },
  ],
});
