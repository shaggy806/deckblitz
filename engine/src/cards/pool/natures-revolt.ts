import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 13224. Living Plane's shape at 2/2.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.

const TEXT = "All lands are 2/2 creatures that are still lands.";

export default defineCard({
  name: "Nature's Revolt",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      addTypes: ["creature"],
      setBasePt: { power: 2, toughness: 2 },
      text: TEXT,
    },
  ],
});
