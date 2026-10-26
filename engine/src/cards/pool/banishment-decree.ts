import { defineCard } from "../define.js";

export default defineCard({
  name: "Banishment Decree",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put target artifact, creature, or enchantment on top of its owner's library.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
