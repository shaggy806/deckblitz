import { defineCard } from "../define.js";

// EDHREC rank 31997.
//
// The intervening-if (rule 603.4) is "you control no nonland permanent that
// isn't white" — colourless ones included, and Zealots itself (`countsSelf`), so
// a Zealots made another colour stops its own trigger.
const TEXT = "At the beginning of your upkeep, if all nonland permanents you control are white, you gain 1 life.";

export default defineCard({
  name: "Zealots en-Dal",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { notTypes: ["land"], notColors: ["W"] }, atLeast: 1, countsSelf: true },
      },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
