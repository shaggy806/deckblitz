import { defineCard } from "../define.js";

// One ability with two trigger events (`sameAbilityAs`). Up to one creature
// card and up to one land card from among the milled ones, moved together.

const TEXT =
  "Whenever this creature enters or attacks, mill five cards. You may put a creature card and/or a land card from among them into your hand.";
const MILL_AND_TAKE = {
  kind: "sequence",
  effects: [
    { kind: "mill", target: "you", amount: 5 },
    {
      kind: "look-and-choose",
      zone: "graveyard",
      min: 0,
      max: 2,
      filter: { thisWay: "milled" },
      together: {
        oneEach: [
          { label: "a creature card", filter: { type: "creature" } },
          { label: "a land card", filter: { type: "land" } },
        ],
        text: "a creature card and/or a land card",
      },
      destination: "hand",
      leftover: "stay",
    },
  ],
} as const;

export default defineCard({
  name: "Sludge Titan",
  manaCost: "{4}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: MILL_AND_TAKE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: MILL_AND_TAKE,
      resolve: null,
      text: TEXT,
    },
  ],
});
