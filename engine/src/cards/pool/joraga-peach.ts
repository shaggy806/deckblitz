import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2). A Food by subtype only: it has no
// printed Food ability. The sacrifice is a cost, so "each counter on this
// artifact" and "its +1/+1 counters" read it as it last existed (rule
// 608.2h).

export default defineCard({
  name: "Joraga Peach",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Food"],
  text: "Landfall — Whenever a land you control enters, put a +1/+1 counter on this artifact.\n{2}, {T}, Sacrifice this artifact: You gain 1 life for each counter on this artifact. Put its +1/+1 counters onto up to one target creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { countersOn: "source" } },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: { countersOn: "source", counter: "+1/+1" } },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: You gain 1 life for each counter on this artifact. Put its +1/+1 counters onto up to one target creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, put a +1/+1 counter on this artifact.",
    },
  ],
});
