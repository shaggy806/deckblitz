import { defineCard } from "../define.js";

// Dissension.
const REACH = "{G}: Target creature with a +1/+1 counter on it gains reach until end of turn.";

export default defineCard({
  name: "Aquastrand Spider",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider", "Mutant"],
  power: 0,
  toughness: 0,
  text: "Graft 2 (This creature enters with two +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n{G}: Target creature with a +1/+1 counter on it gains reach until end of turn. (It can block creatures with flying.)",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      resolve: null,
      text: REACH,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Aquastrand Spider onto the creature that entered?",
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
