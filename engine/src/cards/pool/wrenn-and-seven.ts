import { defineCard } from "../define.js";

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;
const PLUS_TEXT =
  "+1: Reveal the top four cards of your library. Put all land cards revealed this way into your hand and the rest into your graveyard.";
const ZERO_TEXT = "0: Put any number of land cards from your hand onto the battlefield tapped.";
const MINUS_THREE_TEXT =
  '−3: Create a green Treefolk creature token with reach and "This token\'s power and toughness are each equal to the number of lands you control."';
const MINUS_EIGHT_TEXT =
  '−8: Return all permanent cards from your graveyard to your hand. You get an emblem with "You have no maximum hand size."';

export default defineCard({
  name: "Wrenn and Seven",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Wrenn"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${ZERO_TEXT}\n${MINUS_THREE_TEXT}\n${MINUS_EIGHT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { type: "land" },
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Treefolk Token (Reach, Lands)", count: 1 },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-from-graveyard",
            filter: { typesAnyOf: [...PERMANENT_TYPES] },
            destination: "hand",
            count: "all",
          },
          {
            kind: "create-emblem",
            text: "You have no maximum hand size.",
            static: { affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." },
          },
        ],
      },
      resolve: null,
      text: MINUS_EIGHT_TEXT,
    },
  ],
});
