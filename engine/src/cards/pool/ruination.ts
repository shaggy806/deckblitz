import { defineCard } from "../define.js";

// EDHREC rank 8403.

export default defineCard({
  name: "Ruination",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all nonbasic lands.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "land", notSupertype: "basic" } },
});
