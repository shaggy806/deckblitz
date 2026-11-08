import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more counters are put on a creature you control, if it's the first time counters have been put on that creature this turn, put a +1/+1 counter on that creature.";

// The timing wrapper's `firstTimeEachTurn` on `counters-put` (B278): counted
// per creature, any kind of counter. "If it's the first time" is about the
// event that triggered it, so it stays true as the ability resolves.
export default defineCard({
  name: "Stalwart Successor",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "you-control", filter: { type: "creature" }, firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
