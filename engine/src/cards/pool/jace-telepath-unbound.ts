import { defineCard } from "../define.js";

// The −3 is a permission for this turn at the card's normal timing, its costs
// paid (its rulings), the spell exiled if it would go to your graveyard.
const PLUS = "+1: Up to one target creature gets -2/-0 until your next turn.";
const MINUS = "−3: You may cast target instant or sorcery card from your graveyard this turn. If that spell would be put into your graveyard, exile it instead.";
const ULT = "−9: You get an emblem with \"Whenever you cast a spell, target opponent mills five cards.\"";

export default defineCard({
  name: "Jace, Telepath Unbound",
  art: "https://cards.scryfall.io/art_crop/back/0/2/02d6d693-f1f3-4317-bcc0-c21fa8490d38.jpg",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "until-your-next-turn" },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "grant-graveyard-cast", target: 0, exileAfter: true },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Whenever you cast a spell, target opponent mills five cards.",
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you" },
            targets: ["opponent"],
            effect: { kind: "mill", target: 0, amount: 5 },
            resolve: null,
            text: "Whenever you cast a spell, target opponent mills five cards.",
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
  faces: ["Jace, Vryn's Prodigy", "Jace, Telepath Unbound"],
  transform: true,
});
