import { defineCard } from "../define.js";

// EDHREC rank 20412.

export default defineCard({
  name: "Reclaiming Vines",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target artifact, enchantment, or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
