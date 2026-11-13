import { defineCard } from "../define.js";

// EDHREC rank 25121.
//
// Rulings (abridged):
//   Creatures you control enter as copies of Essence of the Wild, so their
//   own printed "enters" triggers and replacements don't apply; external
//   ones (Urabrask the Hidden's "enter tapped") still do.
//   A Clone entering under you has two copy effects; in either order it's a
//   copy of Essence of the Wild.
//   A creature already copying Essence of the Wild with a modified copy
//   effect (Cryptoplasm) passes that modification on.
//   With more than one, creatures enter as a copy of the one whose copy
//   effect you apply last.
//
// `others-enter-battlefield`'s `asCopyOf: "source"` (`Game.enterAsCopyAsked`).
const TEXT = "Creatures you control enter as a copy of this creature.";

export default defineCard({
  name: "Essence of the Wild",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "others-enter-battlefield", filter: { type: "creature", controlledBy: "you" }, asCopyOf: "source" },
      text: TEXT,
    },
  ],
});
