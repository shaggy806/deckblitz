import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Each player chooses in turn order, then everything not chosen is
// sacrificed at once; a player with three or fewer permanents keeps them all (the rulings).

export default defineCard({
  name: "Razia's Purification",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Each player chooses three permanents they control, then sacrifices the rest.",
  targets: [],
  effect: { kind: "sacrifice-all-but", who: "each-player", keep: 3, filter: {} },
});
