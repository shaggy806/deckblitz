import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 23101. `n: "x"` reads the X the
// ability was activated with (Steel Hellkite).

const TEXT = "{X}{R}, {T}, Discard a card: Destroy all artifacts with mana value X or less.";

export default defineCard({
  name: "Hammer Mage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "artifact", manaValue: { op: "lte", n: "x" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
