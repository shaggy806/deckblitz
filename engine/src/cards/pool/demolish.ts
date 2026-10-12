import { defineCard } from "../define.js";

export default defineCard({
  name: "Demolish",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
