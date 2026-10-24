import { defineCard } from "../define.js";

export default defineCard({
  name: "Angelic Purge",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a permanent.\nExile target artifact, creature, or enchantment.",
  additionalCost: { sacrifice: {} },
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
  effect: { kind: "exile", target: 0 },
});
