import { defineCard } from "../define.js";

// EDHREC rank 17559.
//
// Snapcaster Mage's grant (`grant-flashback`, a cost equal to the card's mana
// cost — none for a card with no mana cost, the ruling) on a "whenever you
// cast a Human spell" trigger. The trigger resolves before the Human spell.
//
// Rulings:
//   [2023-04-14] If a card with no mana cost gains flashback, it has no flashback cost. It can't
//     be cast this way.
//   [2023-04-14] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.

const CAST_TEXT =
  "Whenever you cast a Human spell, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.";

export default defineCard({
  name: "Katilda and Lier",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 3,
  toughness: 3,
  text: `${CAST_TEXT} (You may cast that card from your graveyard for its flashback cost. Then exile it.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Human" } },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: { kind: "grant-flashback", target: 0 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
