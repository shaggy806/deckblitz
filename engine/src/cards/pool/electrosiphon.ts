import { defineCard } from "../define.js";

// EDHREC rank 5786. "Its mana value" is the countered spell's as it last was
// on the stack, its {X} included (rule 608.2h — the ruling): `manaValueOf`
// reads that once the counter has moved it. With the target gone, the whole
// spell does nothing (no energy — the ruling).

export default defineCard({
  name: "Electrosiphon",
  manaCost: "{U}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter target spell. You get an amount of {E} (energy counters) equal to its mana value.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "get-energy", amount: { manaValueOf: 0 } },
    ],
  },
});
