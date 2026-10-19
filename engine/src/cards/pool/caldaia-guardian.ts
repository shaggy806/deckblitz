import { defineCard } from "../define.js";

const DIES_TEXT =
  "Whenever this creature or another creature you control with mana value 4 or greater dies, create two 1/1 green and white Citizen creature tokens.";
const BLITZ_TEXT =
  'Blitz {2}{G} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';
const CITIZENS = { kind: "create-token", token: "Citizen Token", count: 2 } as const;

// "This creature or another …" is two triggers (Warbeast of Gorgoroth's
// shape): this creature whatever its mana value, and each other creature you
// controlled with mana value 4 or greater, read as it last existed (rule
// 603.10a). Dying together, each triggers it once.
export default defineCard({
  name: "Caldaia Guardian",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 3,
  text: `${DIES_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{2}{G}" },
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: CITIZENS,
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", manaValue: { op: "gte", n: 4 } },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: CITIZENS,
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
