import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29400.
//
// Rulings:
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.
//   [2021-06-18] The basic land types are Plains, Island, Swamp, Mountain, and Forest. Land types
//     other than basic land types (such as Desert) don't contribute to domain abilities.
const TEXT = "Domain — This creature gets +1/+0 for each basic land type among lands you control.";

export default defineCard({
  name: "Kavu Scout",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Scout"],
  power: 0,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { basicLandTypes: true, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
