import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Descend 4 granting flying — Theorix
// Metamage's conditional keyword, on the permanent-card count.

const DESCEND =
  "Descend 4 — This creature has flying as long as there are four or more permanent cards in your graveyard.";

export default defineCard({
  name: "Didact Echo",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 3,
  toughness: 2,
  text: `When this creature enters, draw a card.\n${DESCEND}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 4,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      grantKeywords: ["flying"],
      text: DESCEND,
    },
  ],
});
