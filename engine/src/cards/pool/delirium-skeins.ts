import { defineCard } from "../define.js";

// EDHREC rank 7378.
//
// Each player chooses three cards in turn order from the active player, face
// down, then all are discarded at once (the ruling; rule 101.4).
export default defineCard({
  name: "Delirium Skeins",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player discards three cards.",
  effect: { kind: "discard", target: "each-player", amount: 3 },
});
