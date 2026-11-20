import { defineCard } from "../define.js";

// Shards of Alara (ALA). The free cast and the flash come together, as one
// permission (`freeCastIf.flash`): a paid cast keeps a creature's timing. A
// creature attacking you, not a planeswalker of yours (the rulings), and any
// lands with the subtypes, one land both (Savannah) included.
export default defineCard({
  name: "Qasali Ambusher",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nIf a creature is attacking you and you control a Forest and a Plains, you may cast this creature without paying its mana cost and as though it had flash.",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "controls", filter: { type: "creature", attackingYou: true }, atLeast: 1, anyController: true },
        { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      ],
    },
    flash: true,
  },
});
