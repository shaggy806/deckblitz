import { defineCard } from "../define.js";

// Rulings:
//   [2005-10-01] The damage prevention shield lasts for the rest of the turn, and you gain life each
//     time that shield prevents 1 or more damage.
export default defineCard({
  name: "Chant of Vitu-Ghazi",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nPrevent all damage that would be dealt by creatures this turn. You gain life equal to the damage prevented this way.",
  targets: [],
  effect: { kind: "damage-rule", by: { filter: { type: "creature" } }, gainLifePrevented: true },
});
