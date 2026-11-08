import { defineCard } from "../define.js";

const MANA = "+1: Add {R}{R}{R}. Spend this mana only to cast instant or sorcery spells.";
const LOOT = "+1: Discard up to three cards, then draw that many cards.";
const EMBLEM =
  "You may cast instant and sorcery spells from your graveyard. If a spell cast this way would be put into your graveyard, exile it instead.";
const ULT = `−8: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Jaya Ballard",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jaya"],
  loyalty: 5,
  text: `${MANA}\n${LOOT}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["R", "R", "R"] },
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast instant or sorcery spells.",
        },
      },
      resolve: null,
      text: MANA,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true, atMost: 3 },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: LOOT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: { scope: "self" },
          mayPlay: { from: "graveyard", filter: { typesAnyOf: ["instant", "sorcery"] }, exileAfter: true },
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
