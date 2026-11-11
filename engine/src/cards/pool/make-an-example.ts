import { defineCard } from "../define.js";

// EDHREC rank 5575. Three instructions, each for every opponent (rule
// 608.2e): all separate, in turn order; then you choose a pile of each (the
// ruling: "their chosen pile" is the one you chose); then every chosen pile
// is sacrificed at once — `separate-into-piles`' `each`.

export default defineCard({
  name: "Make an Example",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent separates the creatures they control into two piles. For each opponent, you choose one of their piles. Each opponent sacrifices the creatures in their chosen pile. (Piles can be empty.)",
  targets: [],
  effect: {
    kind: "separate-into-piles",
    each: "each-opponent",
    objects: { permanents: { type: "creature" }, whose: "that-player" },
    chooser: "you",
    chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } },
  },
});
