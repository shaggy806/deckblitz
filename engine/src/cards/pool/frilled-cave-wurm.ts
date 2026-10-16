import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Descend 4 as a static condition — Basking
// Capybara's shape.

const TEXT =
  "Descend 4 — This creature gets +2/+0 as long as there are four or more permanent cards in your graveyard.";

export default defineCard({
  name: "Frilled Cave-Wurm",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Salamander", "Wurm"],
  power: 2,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 4,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
