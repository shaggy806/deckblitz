import { defineCard } from "../define.js";

// EDHREC rank 26724. Ikoria: Lair of Behemoths.
//
// Rulings:
//   - If Spelleater Wolverine loses double strike after it deals first-strike damage, it won't
//     deal regular combat damage. If it gains double strike after other creatures have dealt
//     first-strike damage, it won't deal first-strike damage.
const TEXT =
  "This creature has double strike as long as there are three or more instant and/or sorcery cards in your graveyard.";

export default defineCard({
  name: "Spelleater Wolverine",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolverine"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { typesAnyOf: ["instant", "sorcery"] } },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
