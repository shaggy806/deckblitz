import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunder from Within",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Destroy target artifact or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
