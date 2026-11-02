import { defineCard } from "../define.js";

const SOLDIER = "+1: Create a 1/1 white Soldier creature token.";
const PUMP = "+1: Target creature gets +3/+3 and gains flying until end of turn.";
const EMBLEM = "Artifacts, creatures, enchantments, and lands you control have indestructible.";
const ULT = `−8: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Elspeth, Knight-Errant",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elspeth"],
  loyalty: 4,
  text: `${SOLDIER}\n${PUMP}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: SOLDIER,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: {
            scope: "filter",
            filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"], controlledBy: "you" },
          },
          grantKeywords: ["indestructible"],
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
