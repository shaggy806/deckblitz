import { defineCard } from "../define.js";

export default defineCard({
  name: "Rocket Volley",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target nonbasic land.",
  targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
  effect: { kind: "destroy", target: 0 },
  prepareSpellOnly: true,
});
