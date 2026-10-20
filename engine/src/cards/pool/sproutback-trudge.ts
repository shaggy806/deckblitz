import { defineCard } from "../define.js";

// The reduction counts life gained this turn, whatever was lost (its ruling),
// and reduces only generic mana — never below {G}{G}. Cast from the graveyard
// by its end-step trigger, it's still cast by the ordinary rules: its cost is
// paid, reduced the same way (its ruling).
const COST_TEXT = "This spell costs {X} less to cast, where X is the amount of life you gained this turn.";
const END_TEXT =
  "At the beginning of your end step, if you gained life this turn, you may cast this creature from your graveyard.";

export default defineCard({
  name: "Sproutback Trudge",
  manaCost: "{7}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Beast"],
  power: 9,
  toughness: 7,
  keywords: ["trample"],
  text: `${COST_TEXT}\nTrample\n${END_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "life-gained", who: "you" },
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "cast-now", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
