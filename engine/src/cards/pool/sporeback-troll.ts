import { defineCard } from "../define.js";

// Dissension.
const REGEN = "{1}{G}: Regenerate target creature with a +1/+1 counter on it.";

export default defineCard({
  name: "Sporeback Troll",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Mutant"],
  power: 0,
  toughness: 0,
  text: `Graft 2 (This creature enters with two +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n${REGEN}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      ],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: REGEN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Sporeback Troll onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 2",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "Graft 2",
    },
  ],
});
