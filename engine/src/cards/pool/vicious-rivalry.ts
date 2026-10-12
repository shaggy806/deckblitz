import { defineCard } from "../define.js";

// Toxic Deluge's X paid in life (`additionalCost.payLifeX`): the printed cost
// has no {X}, and "x" reads the life paid. A permanent with {X} in its cost
// has mana value with X = 0 on the battlefield (the ruling).
export default defineCard({
  name: "Vicious Rivalry",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, pay X life.\n" +
    "Destroy all artifacts and creatures with mana value X or less.",
  additionalCost: { payLifeX: true },
  effect: {
    kind: "destroy-all",
    filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: "x" } },
  },
});
