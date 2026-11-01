import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29025.
//
// Rulings:
//   [2021-06-18] The basic land types are Plains, Island, Swamp, Mountain, and Forest. Land types
//     other than basic land types (such as Desert) don't contribute to domain abilities.
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.
const TEXT = "Domain — Enchanted creature gets -1/-1 for each basic land type among lands you control.";

export default defineCard({
  name: "Exotic Curse",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { basicLandTypes: true, pt: [-1, -1] },
      text: TEXT,
    },
  ],
});
