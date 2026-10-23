import { defineCard } from "../define.js";

/** The back face of Archangel Avacyn. */
const TRANSFORM_TEXT =
  "When this creature transforms into Avacyn, the Purifier, it deals 3 damage to each other creature and each opponent.";

export default defineCard({
  name: "Avacyn, the Purifier",
  art: "https://cards.scryfall.io/art_crop/back/f/e/fe675f03-cbb5-4177-b7d7-64a30260ee2a.jpg",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 3, exceptSource: true },
          { kind: "damage", amount: 3, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Archangel Avacyn", "Avacyn, the Purifier"],
  transform: true,
});
