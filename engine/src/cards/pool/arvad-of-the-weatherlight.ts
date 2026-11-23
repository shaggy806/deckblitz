import { defineCard } from "../define.js";

// Playtest card. Rulebreaker is a deckbuilding rule only (`rulebreaker`, read
// by deck-validation.ts): a legendary permanent card is a legendary card of
// any permanent type (rule 110.4), one `anyIdentity` entry per type.

const RULEBREAKER =
  "Rulebreaker — If Arvad of the Weatherlight is your Commander, you may include legendary permanents of any color in your deck regardless of color identity.";
const COMBAT =
  "Whenever Arvad deals combat damage to an opponent, you may put a legendary permanent card from your hand onto the battlefield.";
const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;

export default defineCard({
  name: "Arvad of the Weatherlight",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  text: `${RULEBREAKER}\n${COMBAT}`,
  rulebreaker: {
    anyIdentity: PERMANENT_TYPES.map((type) => ({ supertypes: ["legendary"], types: [type] })),
  },
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { supertype: "legendary", typesAnyOf: [...PERMANENT_TYPES] },
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
