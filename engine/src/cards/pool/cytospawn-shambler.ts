import { defineCard } from "../define.js";

export default defineCard({
  name: "Cytospawn Shambler",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Mutant"],
  power: 0,
  toughness: 0,
  text: "Graft 6 (This creature enters with six +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n{G}: Target creature with a +1/+1 counter on it gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "{G}: Target creature with a +1/+1 counter on it gains trample until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Cytospawn Shambler onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 6",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: "Graft 6",
    },
  ],
});
