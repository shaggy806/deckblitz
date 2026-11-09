import { defineCard } from "../define.js";

// Core Set 2020.
const PLUS = "+2: Until your next turn, up to one target creature gets -2/-0 and loses flying.";
const BIRD = "−3: Create a 4/4 blue Elemental Bird creature token with flying.";
const EMBLEM = "Islands you control have \"{T}: Draw a card.\"";
const ULT = "−8: You get an emblem with \"Islands you control have '{T}: Draw a card.'\"";

export default defineCard({
  name: "Mu Yanling, Sky Dancer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Yanling"],
  loyalty: 2,
  text: `${PLUS}\n${BIRD}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "until-your-next-turn" },
          { kind: "become", target: 0, loseKeywords: ["flying"], duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Bird Token (Mu Yanling, Sky Dancer)", count: 1 },
      resolve: null,
      text: BIRD,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: { scope: "filter", filter: { subtype: "Island", controlledBy: "you" } },
          grantsActivated: [
            {
              cost: { mana: null, tap: true },
              targets: [],
              effect: { kind: "draw", amount: 1 },
              resolve: null,
              text: "{T}: Draw a card.",
            },
          ],
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
