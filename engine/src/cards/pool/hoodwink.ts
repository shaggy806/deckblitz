import { defineCard } from "../define.js";

export default defineCard({
  name: "Hoodwink",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target artifact, enchantment, or land to its owner's hand.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment", "land"] } }],
  effect: { kind: "return-to-hand", target: 0 },
});
