import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 16789. Urborg, Tomb of Yawgmoth's static: a land
// type added in layer 4, which brings its intrinsic "{T}: Add {B}" (rule 305.6)
// and leaves names and the basic supertype alone (the rulings).

export default defineCard({
  name: "Blanket of Night",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Each land is a Swamp in addition to its other land types.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      addSubtypes: ["Swamp"],
      text: "Each land is a Swamp in addition to its other land types.",
    },
  ],
});
