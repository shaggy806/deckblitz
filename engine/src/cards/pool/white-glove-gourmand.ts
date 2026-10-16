import { defineCard } from "../define.js";

// EDHREC rank 14113. Fallout (PIP).
//
// The end-step ability is an intervening if (rule 603.4): it triggers once
// however many Humans died, and not at all if none did as the step began.
// The Gourmand needn't have seen the Human die (the rulings) — it reads the
// turn's history.
const ENTER_TEXT = "When this creature enters, create two 1/1 white Human Soldier creature tokens.";
const FOOD_TEXT =
  "At the beginning of your end step, if another Human died under your control this turn, create a Food token.";

export default defineCard({
  name: "White Glove Gourmand",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${FOOD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { subtype: "Human" }, excludeSelf: true },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
});
