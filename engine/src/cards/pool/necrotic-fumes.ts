import { defineCard } from "../define.js";

export default defineCard({
  name: "Necrotic Fumes",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "As an additional cost to cast this spell, exile a creature you control.\nExile target creature or planeswalker.",
  additionalCost: { sacrifice: { type: "creature" }, exilesSacrifice: true },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "exile", target: 0 },
});
