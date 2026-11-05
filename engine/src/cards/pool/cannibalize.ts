import { defineCard } from "../define.js";

export default defineCard({
  name: "Cannibalize",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose two target creatures controlled by the same player. Exile one of those creatures and put two +1/+1 counters on the other.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, sameController: true }],
  effect: {
    kind: "choose-among-targets",
    chooser: "you",
    count: 1,
    prompt: "Choose the creature to exile — the other gets two +1/+1 counters",
    chosen: { effect: { kind: "exile", target: 0 } },
    rest: { effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 } },
  },
});
