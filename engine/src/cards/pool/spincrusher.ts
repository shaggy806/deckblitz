import { defineCard } from "../define.js";

export default defineCard({
  name: "Spincrusher",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 2,
  text: "Whenever this creature blocks, put a +1/+1 counter on it.\nRemove a +1/+1 counter from this creature: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Remove a +1/+1 counter from this creature: This creature can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature blocks, put a +1/+1 counter on it.",
    },
  ],
});
