import { defineCard } from "../define.js";

// "With power or toughness 1 or less" is read as the creature last existed
// on the battlefield (the ruling): a dies trigger's filter is matched against
// its last-known information. Arnyn sees itself die.
const DIES_TEXT =
  "Whenever a creature you control with power or toughness 1 or less dies, target opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Arnyn, Deathbloom Botanist",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Druid"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", anyOf: [{ power: { op: "lte", n: 1 } }, { toughness: { op: "lte", n: 1 } }] },
      },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
