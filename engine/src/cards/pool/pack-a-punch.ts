import { defineCard } from "../define.js";

// Kirol, History Buff's prepare spell (rule 722): no card of its own.

export default defineCard({
  name: "Pack a Punch",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Mill a card. Put two +1/+1 counters on target creature. It gains trample until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 1 },
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
  prepareSpellOnly: true,
});
