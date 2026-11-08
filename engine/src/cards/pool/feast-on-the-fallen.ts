import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of each upkeep, if an opponent lost life last turn, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Feast on the Fallen",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      // "Last turn": the turn before this one, whoever's it was (the journal's).
      condition: { kind: "turn-history", what: "life-lost", who: "opponent", window: "last-turn", atLeast: 1 },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
