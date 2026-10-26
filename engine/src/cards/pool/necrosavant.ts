import { defineCard } from "../define.js";

// EDHREC rank 26938.
//
// Rulings:
//   [2004-10-04] The ability is activated while this card is in the graveyard.
//
// Grafted Butcher's self-return from the graveyard, timed like Hammer of
// Bogardan's "Activate only during your upkeep".

export default defineCard({
  name: "Necrosavant",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 5,
  toughness: 5,
  text: "{3}{B}{B}, Sacrifice a creature: Return this card from your graveyard to the battlefield. Activate only during your upkeep.",
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: false, sacrifice: "creature-you-control" },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: "{3}{B}{B}, Sacrifice a creature: Return this card from your graveyard to the battlefield. Activate only during your upkeep.",
    },
  ],
});
