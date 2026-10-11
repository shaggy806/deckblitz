import { defineCard } from "../define.js";

// EDHREC rank 6746.
//
// Rulings:
//   If the targeted creature loses all its -1/-1 counters by the time the ability resolves, the
//     ability won't resolve because its only target is illegal.
//   This ability is mandatory: your own creature if it's the only one with a -1/-1 counter.
//   You can't target a creature unless it already has a -1/-1 counter on it as your upkeep begins.
//
// The counter clause is part of the target's filter, so it is checked both as
// the trigger is put on the stack and again as it resolves (rule 608.2b).
const TEXT = "At the beginning of your upkeep, destroy target creature with a -1/-1 counter on it.";

export default defineCard({
  name: "Crumbling Ashes",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
