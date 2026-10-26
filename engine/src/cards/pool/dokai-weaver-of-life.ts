import { defineCard } from "../define.js";

export default defineCard({
  name: "Dokai, Weaver of Life",
  art: "https://cards.scryfall.io/art_crop/front/5/8/58164521-aeec-43fc-9db9-d595432dea6f.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  text: "{4}{G}{G}, {T}: Create an X/X green Elemental creature token, where X is the number of lands you control.",
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Elemental Token (Dance of the Tumbleweeds)",
        count: 1,
        basePt: {
          power: { countOf: { type: "land", controlledBy: "you" } },
          toughness: { countOf: { type: "land", controlledBy: "you" } },
        },
      },
      resolve: null,
      text: "{4}{G}{G}, {T}: Create an X/X green Elemental creature token, where X is the number of lands you control.",
    },
  ],
  faces: ["Budoka Gardener", "Dokai, Weaver of Life"],
  flip: true,
});
