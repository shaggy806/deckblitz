import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Descend 4 as a static condition: "permanent
// cards" are artifact, battle, creature, enchantment, land and planeswalker
// cards in your graveyard, read live.

const TEXT =
  "Descend 4 — This creature gets +3/+0 as long as there are four or more permanent cards in your graveyard.";

export default defineCard({
  name: "Basking Capybara",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Capybara"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 4,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      grantPt: [3, 0],
      text: TEXT,
    },
  ],
});
