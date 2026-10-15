import { defineCard } from "../define.js";

// EDHREC rank 23675. Secrets of Strixhaven.
//
// Infusion isn't an intervening "if": the ability triggers whether or not you
// gained life this turn, and asks as it resolves (the ruling).
const INFUSION_TEXT = "Infusion — When this creature enters, put two +1/+1 counters on it if you gained life this turn.";

export default defineCard({
  name: "Old-Growth Educator",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 4,
  toughness: 4,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${INFUSION_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: INFUSION_TEXT,
    },
  ],
});
