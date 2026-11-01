import { defineCard } from "../define.js";

// Urza's Destiny (UDS). The caster looks and arranges both ends: the cards
// picked go on the bottom in the order picked, the rest back on top in an
// order asked next (Cruel Fate's shape, with a bottom).

const TEXT =
  "Look at the top five cards of target player's library. Put any number of them on the bottom of that library in any order and the rest on top of the library in any order.";

export default defineCard({
  name: "Ransack",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: 5,
    min: 0,
    max: 5,
    destination: "library-bottom",
    leftover: "top-any-order",
  },
});
