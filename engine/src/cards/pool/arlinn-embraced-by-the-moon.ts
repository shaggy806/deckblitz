import { defineCard } from "../define.js";

const YOURS = { type: "creature", controlledBy: "you" } as const;
const EMBLEM_GRANT = "{T}: This creature deals damage equal to its power to any target.";
const EMBLEM_TEXT = `Creatures you control have haste and '${EMBLEM_GRANT}'`;

export default defineCard({
  name: "Arlinn, Embraced by the Moon",
  art: "https://cards.scryfall.io/art_crop/back/e/7/e72d7c11-2165-4c72-80f3-3c1a7b4b5572.jpg",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Arlinn"],
  text: `+1: Creatures you control get +1/+1 and gain trample until end of turn.\n−1: Arlinn deals 3 damage to any target. Transform Arlinn.\n−6: You get an emblem with "${EMBLEM_TEXT}."`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "+1: Creatures you control get +1/+1 and gain trample until end of turn.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: "−1: Arlinn deals 3 damage to any target. Transform Arlinn.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: {
          affects: { scope: "filter", filter: YOURS },
          grantKeywords: ["haste"],
          grantsActivated: [
            {
              cost: { mana: null, tap: true },
              targets: ["any-target"],
              effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
              resolve: null,
              text: EMBLEM_GRANT,
            },
          ],
          text: EMBLEM_TEXT,
        },
      },
      resolve: null,
      text: `−6: You get an emblem with "${EMBLEM_TEXT}."`,
    },
  ],
  faces: ["Arlinn Kord", "Arlinn, Embraced by the Moon"],
  transform: true,
});
