import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 24579.
//
// Rulings:
//   A "permanent card" is an artifact card, a creature card, an enchantment card, a planeswalker
//     card, or a land card. Most "Rebel permanent cards" are creature cards.

const TEXT =
  "{6}, {T}: Return target Rebel permanent card with mana value 5 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Ramosian Revivalist",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Rebel", notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 5 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
