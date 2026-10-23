import { defineCard } from "../define.js";

// EDHREC rank 26394. Haunted Dead's graveyard return.
//
// Rulings:
//   Ghoulsteed's ability can only be activated while it's in your graveyard.

const RETURN_TEXT = "{2}{B}, Discard two cards: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Ghoulsteed",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Horse"],
  power: 4,
  toughness: 4,
  text: RETURN_TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, discard: { count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
