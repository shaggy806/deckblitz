import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of each upkeep, if you lost life last turn, put a +1/+1 counter on this creature.";
const DIES_TEXT = "When this creature dies, you gain life equal to its toughness.";

export default defineCard({
  name: "Paladin of Atonement",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 1,
  toughness: 1,
  text: `${UPKEEP_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "turn-history", what: "life-lost", window: "last-turn", atLeast: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      // Its toughness as it last existed on the battlefield (rule 608.2h).
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
