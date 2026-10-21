import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 17395.
//
// Rulings:
//   [2004-10-04] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
//
// Every Forest, whoever controls it: a creature in addition to its types
// (layer 4) with base 1/1 (layer 7b). The static's reach is fixed in layer 4
// (rule 613.6), so the 1/1 goes to exactly the Forests it animated.
const TEXT = "All Forests are 1/1 creatures that are still lands.";

export default defineCard({
  name: "Living Lands",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Forest" } },
      addTypes: ["creature"],
      setBasePt: { power: 1, toughness: 1 },
      text: TEXT,
    },
  ],
});
