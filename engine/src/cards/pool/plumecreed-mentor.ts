import { defineCard } from "../define.js";

// EDHREC rank 14259. "This creature or another creature you control with
// flying" is two triggers: this creature entering (with flying or not), and
// another flier you control entering.
const TEXT =
  "Whenever this creature or another creature you control with flying enters, put a +1/+1 counter on target creature you control without flying.";
const TARGET = { kind: "permanent", filter: { type: "creature", controlledBy: "you", notKeyword: "flying" } } as const;
const EFFECT = { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Plumecreed Mentor",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [TARGET],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", keyword: "flying" },
        otherOnly: true,
      },
      targets: [TARGET],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
