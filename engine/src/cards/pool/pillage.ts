import { defineCard } from "../define.js";

export default defineCard({
  name: "Pillage",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact or land. It can't be regenerated.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
