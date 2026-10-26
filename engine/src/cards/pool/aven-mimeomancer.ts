import { defineCard } from "../define.js";

// EDHREC rank 13718.
//
// Rulings:
//   The creature keeps its abilities; it just gains flying as well.
//   The effect lasts as long as that creature has a feather counter on it,
//     even after Aven Mimeomancer leaves (`whileCounter` — rule 611.2b).
//   Feather counters moved to another creature don't take the effect along.
//   It overwrites earlier P/T-setting effects only (layer 7b, timestamp
//     order); counters and modifiers still apply on top.

const TEXT =
  "At the beginning of your upkeep, you may put a feather counter on target creature. If you do, that creature has base power and toughness 3/1 and has flying for as long as it has a feather counter on it.";
const FEATHER = { whileCounter: "feather" } as const;

export default defineCard({
  name: "Aven Mimeomancer",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a feather counter on that creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "feather", amount: 1 },
            { kind: "animate", target: 0, power: 3, toughness: 1, addTypes: [], addSubtypes: [], duration: FEATHER },
            { kind: "grant-keyword", target: 0, keyword: "flying", duration: FEATHER },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
