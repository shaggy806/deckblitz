import { defineCard } from "../define.js";

const DIES_TEXT =
  "When Ragnarok dies, destroy target permanent and return target nonlegendary permanent card from your graveyard to the battlefield.";

// The melded back face of Fang, Fearless l'Cie and Vanille, Cheerful l'Cie
// (rule 712.4): never a card of its own.
export default defineCard({
  name: "Ragnarok, Divine Deliverance",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast", "Avatar"],
  power: 7,
  toughness: 6,
  keywords: ["reach", "vigilance", "menace", "trample", "haste"],
  meldOf: ["Fang, Fearless l'Cie", "Vanille, Cheerful l'Cie"],
  text: `Reach, vigilance, menace, trample, haste\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        "permanent",
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            notSupertype: "legendary",
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "put-onto-battlefield", target: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
