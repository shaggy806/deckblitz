import { defineCard } from "../define.js";

export default defineCard({
  name: "Atzal, Cave of Eternity",
  art: "https://cards.scryfall.io/art_crop/back/d/8/d81c4b3f-81c2-403b-8a5d-c9415f73a1f9.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "(Transforms from Journey to Eternity.)\n{T}: Add one mana of any color.\n{3}{B}{G}, {T}: Return target creature card from your graveyard to the battlefield.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{3}{B}{G}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "{3}{B}{G}, {T}: Return target creature card from your graveyard to the battlefield.",
    },
  ],
  faces: ["Journey to Eternity", "Atzal, Cave of Eternity"],
  transform: true,
});
