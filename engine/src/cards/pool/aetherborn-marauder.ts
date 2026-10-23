import { defineCard } from "../define.js";

// "Any number of +1/+1 counters from other permanents you control": the
// permanents to take from are chosen one at a time as the trigger resolves
// (none to stop — zero is allowed, the ruling), and how many from each; a
// chosen end is never the other end, so this creature is never one of them.
// Not targets.

const ETB_TEXT =
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
  text: `Flying, lifelink\n${ETB_TEXT}`,
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
      text: ETB_TEXT,
    },
  ],
});
