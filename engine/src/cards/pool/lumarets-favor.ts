import { defineCard } from "../define.js";

// EDHREC rank 22357.
//
// Infusion: the cast trigger always triggers, and asks whether you gained
// life this turn as it resolves (the ruling) — once, so one copy. The copy
// keeps the original's target unless a new one is chosen (the ruling).
const INFUSION_TEXT =
  "Infusion — When you cast this spell, copy it if you gained life this turn. You may choose new targets for the copy.";
const PUMP_TEXT = "Target creature gets +2/+4 until end of turn.";

export default defineCard({
  name: "Lumaret's Favor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `${INFUSION_TEXT}\n${PUMP_TEXT}`,
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 4, duration: "end-of-turn" },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
        then: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: INFUSION_TEXT,
    },
  ],
});
