import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 10768.
//
// Rulings:
//   [2025-06-06] An "artifact source" is any object with the card type artifact. This means you
//     could spend the mana to activate an ability of an artifact you control or an artifact card
//     in your hand or graveyard, for example.
//
// "An ability of an artifact source" reaches an artifact card in any zone
// (`abilityOfAnyZone` — Secluded Courtyard's "creature source").
const MANA_TEXT =
  "{T}: Add {C}. Spend this mana only to cast an artifact spell or activate an ability of an artifact source.";

export default defineCard({
  name: "Cargo Ship",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${MANA_TEXT}\n${crewText(1)}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
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
    crew(1),
  ],
});
