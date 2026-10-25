import { defineCard } from "../define.js";

// EDHREC rank 16839. The counters are chosen as it resolves (the rulings):
// one other permanent you control at a time, never this creature itself, and
// how many +1/+1 counters off each — none at all included.

const TEXT =
  "When this creature enters, move any number of +1/+1 counters from other permanents you control onto this creature.";

export default defineCard({
  name: "Aetherborn Marauder",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "move-counters",
        from: {
          choose: { controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
          prompt: "Choose another permanent you control to move +1/+1 counters from (none to stop)",
        },
        to: "source",
        counter: "+1/+1",
        amount: "any",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
