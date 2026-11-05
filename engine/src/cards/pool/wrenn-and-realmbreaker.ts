import { defineCard } from "../define.js";

// The emblem's permission keeps every timing rule and cost (the ruling).

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;
const LANDS_TEXT = 'Lands you control have "{T}: Add one mana of any color."';
const PLUS_TEXT =
  "+1: Up to one target land you control becomes a 3/3 Elemental creature with vigilance, hexproof, and haste until your next turn. It's still a land.";
const MINUS_TWO_TEXT =
  "−2: Mill three cards. You may put a permanent card from among the milled cards into your hand.";
const EMBLEM_TEXT = "You may play lands and cast permanent spells from your graveyard.";
const MINUS_SEVEN_TEXT = `−7: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Wrenn and Realmbreaker",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Wrenn"],
  loyalty: 4,
  text: `${LANDS_TEXT}\n${PLUS_TEXT}\n${MINUS_TWO_TEXT}\n${MINUS_SEVEN_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "land-you-control" }],
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["vigilance", "hexproof", "haste"],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
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
            filter: { thisWay: "milled", typesAnyOf: [...PERMANENT_TYPES] },
          },
        ],
      },
      resolve: null,
      text: MINUS_TWO_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: {
          affects: { scope: "self" },
          playFromGraveyard: { type: "land" },
          castFromGraveyard: { filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"] } },
          text: EMBLEM_TEXT,
        },
      },
      resolve: null,
      text: MINUS_SEVEN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "lands-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 1 },
          resolve: null,
          text: "{T}: Add one mana of any color.",
        },
      ],
      text: LANDS_TEXT,
    },
  ],
});
