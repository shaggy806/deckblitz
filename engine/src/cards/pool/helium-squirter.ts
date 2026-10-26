import { defineCard } from "../define.js";

export default defineCard({
  name: "Helium Squirter",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast", "Mutant"],
  power: 0,
  toughness: 0,
  text: "Graft 3 (This creature enters with three +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n{1}: Target creature with a +1/+1 counter on it gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{1}: Target creature with a +1/+1 counter on it gains flying until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Helium Squirter onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 3",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "Graft 3",
    },
  ],
});
