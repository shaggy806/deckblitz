import { defineCard } from "../define.js";

// The back face of Azor's Gateway. A mana ability (the ruling).
const MANA_TEXT = "{T}: Add X mana of any one color, where X is your life total.";

export default defineCard({
  name: "Sanctum of the Sun",
  art: "https://cards.scryfall.io/art_crop/back/3/0/303d51ab-b9c4-4647-950f-291daabe7b81.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `(Transforms from Azor's Gateway.)\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { lifeTotal: "you" } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  faces: ["Azor's Gateway", "Sanctum of the Sun"],
  transform: true,
});
