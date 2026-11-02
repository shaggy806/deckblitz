import { defineCard } from "../define.js";

const LOCK = "Each opponent can cast spells only any time they could cast a sorcery.";
const PLUS = "+1: Until your next turn, you may cast sorcery spells as though they had flash.";
const MINUS = "−3: Return up to one target artifact, creature, or enchantment to its owner's hand. Draw a card.";

export default defineCard({
  name: "Teferi, Time Raveler",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 4,
  text: `${LOCK}\n${PLUS}\n${MINUS}`,
  static: [{ affects: { scope: "self" }, prohibits: { who: "opponents", castOnlyAsSorcery: true }, text: LOCK }],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "until-your-next-turn",
        castAsThoughFlash: { filter: { type: "sorcery" } },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: MINUS,
    },
  ],
});
