import { defineCard } from "../define.js";

export default defineCard({
  name: "The Core",
  art: "https://cards.scryfall.io/art_crop/back/b/4/b4c31b29-06ba-436d-a3d9-18f4796c39be.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "(Transforms from Matzalantli.)\nFathomless descent — {T}: Add X mana of any one color, where X is the number of permanent cards in your graveyard.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: {
          countInGraveyard: {
            typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
            ownedBy: "you",
          },
        },
      },
      resolve: null,
      text: "Fathomless descent — {T}: Add X mana of any one color, where X is the number of permanent cards in your graveyard.",
    },
  ],
  faces: ["Matzalantli, the Great Door", "The Core"],
  transform: true,
});
