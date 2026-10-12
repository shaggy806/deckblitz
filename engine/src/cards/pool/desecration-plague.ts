import { defineCard } from "../define.js";

export default defineCard({
  name: "Desecration Plague",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target enchantment or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["enchantment", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
