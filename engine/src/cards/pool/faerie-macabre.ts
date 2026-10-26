import { defineCard } from "../define.js";

// EDHREC rank 15109.
//
// Rulings:
//   [2008-05-01] The targeted cards may be in the same graveyard or in different graveyards.
//   [2008-05-01] Faerie Macabre's second ability can be activated only while it's in your hand.
//     You can do this any time you could cast an instant.

const MACABRE_TEXT = "Discard this card: Exile up to two target cards from graveyards.";

export default defineCard({
  name: "Faerie Macabre",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${MACABRE_TEXT}`,
  activated: [
    {
      // A hand ability: discarding the card is the cost (channel's shape).
      cost: { mana: null, tap: false },
      zone: "hand",
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "exile", target: 0 },
        simultaneous: true,
      },
      resolve: null,
      text: MACABRE_TEXT,
    },
  ],
});
