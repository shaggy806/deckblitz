import { defineCard } from "../define.js";

// Rulings:
//   You may target a permanent that doesn't have a counter on it.
//   This can remove any kind of counter, not just a -1/-1 counter.
//
// Which counter, and whether to remove one at all, is chosen as the
// trigger resolves (the `remove-counters` decision: any kind, up to one).

const TEXT = "When this creature enters, you may remove a counter from target permanent.";

export default defineCard({
  name: "Medicine Runner",
  manaCost: "{1}{G/W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: { kind: "remove-counters", target: 0, counter: "any", count: 1, upTo: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
