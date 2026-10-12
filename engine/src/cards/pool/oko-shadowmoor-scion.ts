import { defineCard } from "../define.js";

// The back face of Oko, Lorwyn Liege. The −6 chooses the creature type as it
// resolves (`choose-creature-type`, its `$chosen` substituted into the
// emblem's anthem), and the emblem is a creatures-you-control anthem narrowed
// to that type.
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {U}. If you do, transform Oko.";
const MINUS_ONE_TEXT = "−1: Mill three cards. You may put a permanent card from among them into your hand.";
const MINUS_THREE_TEXT = "−3: Create two 3/3 green Elk creature tokens.";
const EMBLEM_TEXT = "Creatures you control of the chosen type get +3/+3 and have vigilance and hexproof.";
const MINUS_SIX_TEXT = `−6: Choose a creature type. You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Oko, Shadowmoor Scion",
  art: "https://cards.scryfall.io/art_crop/back/1/d/1dab370a-1067-4d94-be1f-10362d4abf5a.jpg",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Oko"],
  loyalty: 3,
  text: `${TRANSFORM_TEXT}\n${MINUS_ONE_TEXT}\n${MINUS_THREE_TEXT}\n${MINUS_SIX_TEXT}`,
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: {
              thisWay: "milled",
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            },
          },
        ],
      },
      resolve: null,
      text: MINUS_ONE_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Elk Token", count: 2 },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "create-emblem",
          text: EMBLEM_TEXT,
          static: {
            affects: { scope: "creatures-you-control", subtype: "$chosen" },
            grantPt: [3, 3],
            grantKeywords: ["vigilance", "hexproof"],
            text: EMBLEM_TEXT,
          },
        },
      },
      resolve: null,
      text: MINUS_SIX_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U} to transform Oko?",
        cost: "{U}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Oko, Lorwyn Liege", "Oko, Shadowmoor Scion"],
  transform: true,
});
