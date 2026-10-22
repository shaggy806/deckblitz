import { defineCard } from "../define.js";

// EDHREC rank 30620.
//
// Rulings:
//   [2008-10-01] Fumarole can’t be cast unless you can target both a creature and a land. If
//     there’s a permanent on the battlefield that’s both a creature and a land, it can be both
//     targets.

export default defineCard({
  name: "Fumarole",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, pay 3 life.\nDestroy target creature and target land.",
  additionalCost: { payLife: 3 },
  targets: ["creature", "land"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});
