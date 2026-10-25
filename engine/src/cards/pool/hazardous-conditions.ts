import { defineCard } from "../define.js";

// Any kind of counter keeps a creature out (the ruling): a `counters` clause
// with no kind counts every counter. The affected set is fixed as it resolves.
export default defineCard({
  name: "Hazardous Conditions",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Creatures with no counters on them get -2/-2 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", counters: { compare: { op: "eq", n: 0 } } },
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
