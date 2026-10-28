import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 2635.
//
// The d20 is rolled as the trigger resolves; "when you do" is a reflexive
// ability (rule 603.12) whose targets are chosen after the roll, carrying
// the result as its trigger value — X, read as it triggers.

const TEXT =
  "Whenever this creature deals combat damage to a player, roll a d20. When you do, put X +1/+1 counters on each of up to two target creatures, where X is the result.";

export default defineCard({
  name: "Ancient Bronze Dragon",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        then: {
          kind: "reflexive-trigger",
          targets: distinctTargets(2, "creature", { optional: true }),
          value: { roll: "total" },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: { triggerValue: true } },
              { kind: "add-counter", target: 1, counter: "+1/+1", amount: { triggerValue: true } },
            ],
          },
          text: "When you do, put X +1/+1 counters on each of up to two target creatures, where X is the result.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
