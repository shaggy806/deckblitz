import { defineCard } from "../define.js";

// The back face of Welcome to . . . — a colourless land with no mana cost.
//
// Rulings:
//   [2023-11-10] Escape's permission doesn't change when you may cast the spell from your
//     graveyard.
//   [2023-11-10] If a card has multiple abilities giving you permission to cast it, such as two
//     escape abilities or an escape ability and a flashback ability, you choose which one to
//     apply.
const ESCAPE_TEXT =
  "Each Dinosaur card in your graveyard has escape. The escape cost is equal to the card's mana cost " +
  "plus exile three other cards from your graveyard. (You may cast cards from your graveyard for " +
  "their escape cost.)";
const MANA_TEXT = "{T}: Add {G} for each Dinosaur you control.";

export default defineCard({
  name: "Jurassic Park",
  art: "https://cards.scryfall.io/art_crop/back/6/d/6d84e2d4-38bf-4d46-99a6-37c2dda66b16.jpg",
  supertypes: ["legendary"],
  types: ["land"],
  text: `(Transforms from Welcome to ....)\n${ESCAPE_TEXT}\n${MANA_TEXT}`,
  faces: ["Welcome to . . .", "Jurassic Park"],
  transform: true,
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { subtype: "Dinosaur" }, escape: { cost: "mana-cost", exileCount: 3 } },
      text: ESCAPE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { countOf: { subtype: "Dinosaur", controlledBy: "you" } } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
