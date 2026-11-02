import { defineCard } from "../define.js";

export default defineCard({
  name: "Muraganda Petroglyphs",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Creatures with no abilities get +2/+2.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", hasAbilities: false } },
      grantPt: [2, 2],
      text: "Creatures with no abilities get +2/+2.",
    },
  ],
});
