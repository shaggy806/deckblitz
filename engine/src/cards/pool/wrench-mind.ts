import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 21882.
//
// One artifact card, or any two cards (the ruling) — `unlessOne`, as
// Compulsive Research's land clause.

export default defineCard({
  name: "Wrench Mind",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards unless they discard an artifact card.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 2, unlessOne: { type: "artifact" } },
});
