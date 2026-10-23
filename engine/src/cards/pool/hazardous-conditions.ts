import { defineCard } from "../define.js";

// EDHREC rank 29001. Any kind of counter spares a creature, and the set is
// fixed as it resolves (the rulings — `modify-pt-all`).
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
