import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, distribute three -1/-1 counters among one, two, or three target creatures. For each -1/-1 counter you put on a creature this way, remove a -1/-1 counter from that creature at the beginning of the next end step.";

export default defineCard({
  name: "Shambling Swarm",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "any-number", of: "creature", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "-1/-1 counters" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counters-divided", from: 0, counter: "-1/-1" },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "counters-placed",
            aboutPerCount: true,
            text: "For each -1/-1 counter put on a creature this way, remove a -1/-1 counter from that creature.",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "remove-counter", target: 0, counter: "-1/-1", amount: 1 } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
