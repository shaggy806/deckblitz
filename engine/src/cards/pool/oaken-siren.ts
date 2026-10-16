import { defineCard } from "../define.js";

// EDHREC rank 10899. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] An "artifact source" is any object with the card type artifact. This means you
//     could spend the mana to activate an ability of an artifact you control or an artifact card
//     in your hand or graveyard, for example.
//
// Cargo Ship's restricted mana, in blue; `abilityOfAnyZone` is the ruling's
// artifact card in a hand or graveyard.

const MANA_TEXT =
  "{T}: Add {U}. Spend this mana only to cast an artifact spell or activate an ability of an artifact source.";

export default defineCard({
  name: "Oaken Siren",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Siren", "Pirate"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast an artifact spell or activate an ability of an artifact source.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
