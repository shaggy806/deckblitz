import { defineCard } from "../define.js";

const MANA = "+1: Add {R}{R}{R}. Spend this mana only to cast instant or sorcery spells.";
const LOOT = "+1: Discard up to three cards, then draw that many cards.";
const EMBLEM =
  "You may cast instant and sorcery spells from your graveyard. If a spell cast this way would be put into your graveyard, exile it instead.";
const ULT = `−8: You get an emblem with "${EMBLEM}"`;

const discardThenDraw = (amount: number) => ({
  effect: {
    kind: "sequence" as const,
    effects: [
      { kind: "discard" as const, target: "you" as const, amount },
      { kind: "draw" as const, amount: { thisWay: "discarded" as const } },
    ],
  },
  text: `Discard ${amount}, then draw that many.`,
});

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
      // "Up to three", the number chosen as it resolves, as Daretti's two.
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { effect: { kind: "sequence", effects: [] }, text: "Discard nothing." },
          discardThenDraw(1),
          discardThenDraw(2),
          discardThenDraw(3),
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
          castFromGraveyard: { filter: { typesAnyOf: ["instant", "sorcery"] }, exileAfterwards: true },
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
