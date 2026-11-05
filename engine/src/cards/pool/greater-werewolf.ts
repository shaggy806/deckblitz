import { defineCard } from "../define.js";

const TEXT = "At end of combat, put a -0/-2 counter on each creature blocking or blocked by this creature.";

export default defineCard({
  name: "Greater Werewolf",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", blockingRelation: { relation: "either" } },
        counter: "-0/-2",
        amount: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
