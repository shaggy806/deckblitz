import { defineCard } from "../define.js";

// The back face of Kolvori, God of Kinship.

const SPEND = "Spend this mana only to cast a creature spell of the chosen type or a legendary creature spell.";

export default defineCard({
  name: "The Ringhart Crest",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `As The Ringhart Crest enters, choose a creature type.\n{T}: Add {G}. ${SPEND}`,
  faces: ["Kolvori, God of Kinship", "The Ringhart Crest"],
  chooseCreatureTypeOnEnter: true,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: 1,
        // `chosenType` folds the type named as it entered into `spell`, not
        // `orSpell`: a legendary creature spell of any type.
        spendOnly: {
          spell: { type: "creature" },
          chosenType: true,
          orSpell: { type: "creature", supertype: "legendary" },
          text: SPEND,
        },
      },
      resolve: null,
      text: `{T}: Add {G}. ${SPEND}`,
    },
  ],
});
