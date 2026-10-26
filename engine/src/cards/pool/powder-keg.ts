import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a fuse counter on this artifact.";
const SAC_TEXT =
  "{T}, Sacrifice this artifact: Destroy each artifact and creature with mana value equal to the number of fuse counters on this artifact.";

export default defineCard({
  name: "Powder Keg",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      // The counters are read off the sacrificed Keg as it last existed.
      effect: {
        kind: "destroy-all",
        filter: {
          typesAnyOf: ["artifact", "creature"],
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "fuse" } } },
        },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a fuse counter on Powder Keg?",
        effect: { kind: "add-counter", target: "source", counter: "fuse", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
