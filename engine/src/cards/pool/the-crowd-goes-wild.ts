import { defineCard } from "../define.js";

// Support X is "up to X target creatures", one counter each; then every
// creature with a +1/+1 counter on it as this applies gains trample (the
// rulings). With targets all gone illegal it doesn't resolve at all.
export default defineCard({
  name: "The Crowd Goes Wild",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  assist: true,
  text:
    "Assist (Another player can pay up to {X} of this spell's cost. You choose the value of X.)\n" +
    "Support X. (Put a +1/+1 counter on each of up to X target creatures.)\n" +
    "Each creature with a +1/+1 counter on it gains trample until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: 0, max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
