import { defineCard } from "../define.js";

const PLUS_TEXT =
  "+1: Create a 1/1 black and green Insect creature token, then mill two cards. Put a deathtouch counter on the token if a black card was milled this way.";
const MINUS_TEXT = "−2: Destroy target artifact or enchantment.";
const ULT_TEXT =
  "−6: For each creature card in your graveyard, create a token that's a copy of it, except it's a 1/1 black and green Insect.";

/** Grist, Voracious Larva's back face. The −6 copies each creature card in
 * your graveyard as the card it is (`{ eachInGraveyard }`), fixed before the
 * first copy is made, all in one token event. */
export default defineCard({
  name: "Grist, the Plague Swarm",
  art: "https://cards.scryfall.io/art_crop/back/6/8/68239b41-b7db-4044-b672-6808c2c342ec.jpg",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Grist"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Insect Token (Black-Green)", count: 1 },
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { colors: ["B"] } },
            then: { kind: "add-counter", target: "created", counter: "deathtouch", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: { eachInGraveyard: { type: "creature", ownedBy: "you" } },
        count: 1,
        who: "you",
        exceptions: { power: 1, toughness: 1, setColors: ["B", "G"], setSubtypes: ["Insect"] },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
