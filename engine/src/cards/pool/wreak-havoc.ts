import { defineCard } from "../define.js";

export default defineCard({
  name: "Wreak Havoc",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nDestroy target artifact or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
