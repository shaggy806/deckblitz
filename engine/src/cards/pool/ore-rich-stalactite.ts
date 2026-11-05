import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 14001.
//
// Rulings:
//   [2023-11-10] If the card has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2023-11-10] The back faces of some cards with craft refer to cards "used to craft" it. This
//     refers to the cards exiled as part of the cost of the craft ability of the front face. Those
//     cards are considered to be "used to craft" that permanent as long as they remain exiled and
//     the permanent remains on the battlefield, even if the permanent's controller changes or some
//     of its characteristics change (because of a copy effect, for example.)
//   [2023-11-10] You may exile tokens you control as part of the materials required. However,
//     because they aren't cards and won't stay in exile, any abilities that refer to what you
//     "used to craft" the back faces won't refer to anything.
//   [2023-11-10] If the materials required include multiple objects, you may exile some of them
//     from among permanents you control and the rest from among cards in your graveyard.
//
// The materials are "cards" (rule 702.167b), so they come from the graveyard
// alone (`cardsOnly`), four or more of them (`orMore`).
const MANA_TEXT = "{T}: Add {R}. Spend this mana only to cast an instant or sorcery spell.";
const CRAFT_TEXT =
  "Craft with four or more red instant and/or sorcery cards {3}{R}{R} ({3}{R}{R}, Exile this artifact, Exile the four or more from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Ore-Rich Stalactite",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${CRAFT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    craft(
      "{3}{R}{R}",
      {
        count: 4,
        orMore: true,
        cardsOnly: true,
        filter: { colors: ["R"], typesAnyOf: ["instant", "sorcery"] },
        text: "four or more red instant and/or sorcery cards",
      },
      "Craft with four or more red instant and/or sorcery cards {3}{R}{R}",
    ),
  ],
  faces: ["Ore-Rich Stalactite", "Cosmium Catalyst"],
  transform: true,
});
