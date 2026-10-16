import { defineCard } from "../define.js";

export default defineCard({
  name: "Explorer's Cache",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: "This artifact enters with two +1/+1 counters on it.\nWhenever a creature you control with a +1/+1 counter on it dies, put a +1/+1 counter on this artifact.\n{T}: Move a +1/+1 counter from this artifact onto target creature. Activate only as a sorcery.",
  activated: [
    {
      // A move (rule 122.5): with no +1/+1 counter on it, or it gone, nothing
      // is put on the target (the ruling).
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1" },
      resolve: null,
      text: "{T}: Move a +1/+1 counter from this artifact onto target creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      // Its counters as it last existed on the battlefield.
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control with a +1/+1 counter on it dies, put a +1/+1 counter on this artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This artifact enters with two +1/+1 counters on it.",
    },
  ],
});
