import { defineCard } from "../define.js";

// EDHREC rank 11451.
//
// Rulings:
//   [2021-09-24] Stromkirk Bloodthief's ability cares whether an opponent lost life this turn, not
//     how their life total changed. For example, an opponent who gained 2 life and lost 1 life in
//     the same turn still lost life.
const TEXT =
  "At the beginning of your end step, if an opponent lost life this turn, put a +1/+1 counter on target Vampire you control.";

export default defineCard({
  name: "Stromkirk Bloodthief",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Vampire" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
