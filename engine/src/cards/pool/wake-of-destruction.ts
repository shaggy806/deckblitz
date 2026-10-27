import { defineCard } from "../define.js";

// EDHREC rank 16751.
//
// By name only (rule 201.2a), not land type — the ruling
// (`CardFilter.sameNameAsTarget`).

export default defineCard({
  name: "Wake of Destruction",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land and all other lands with the same name as that land.",
  targets: ["land"],
  effect: { kind: "destroy-all", filter: { type: "land", sameNameAsTarget: 0 } },
});
