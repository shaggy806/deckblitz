import { defineCard } from "../define.js";

const CAST_TEXT =
  'Whenever you cast an artifact or creature spell using mana produced by Barracks of the Thousand, create a white Gnome Soldier artifact creature token with "This token\'s power and toughness are each equal to the number of artifacts and/or creatures you control."';

// "Mana produced by Barracks of the Thousand" is this very permanent's
// (`manaFrom.fromSource`), not another with its name, which the legend rule
// mostly rules out anyway.
export default defineCard({
  name: "Barracks of the Thousand",
  art: "https://cards.scryfall.io/art_crop/back/4/a/4a6bec46-1acd-4726-b8d9-3045ac6a2ea2.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "land"],
  text: `(Transforms from Thousand Moons Smithy.)\n{T}: Add {W}.\n${CAST_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["artifact", "creature"], manaFrom: { fromSource: true } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Soldier Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Thousand Moons Smithy", "Barracks of the Thousand"],
  transform: true,
});
