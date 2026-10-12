import { defineCard } from "../define.js";
import { START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 6300. X is read as the ability resolves — the speed then, 0
// with none (rule 702.179f).
const END_TEXT = "At the beginning of your end step, you draw X cards and lose X life, where X is your speed.";

export default defineCard({
  name: "The Speed Demon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample", "start-your-engines"],
  text: `Flying, trample\n${START_YOUR_ENGINES_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { speed: "you" } },
          { kind: "lose-life", amount: { speed: "you" }, who: "you" },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
