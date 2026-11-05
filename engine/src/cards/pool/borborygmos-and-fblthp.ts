import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Nothing targets until a land is discarded: the second ability is reflexive,
// its target chosen then (the rulings), and it knows how many went.
const WHEN_TEXT =
  "When you discard one or more cards this way, Borborygmos and Fblthp deals twice that much damage to target creature.";
const TEXT = `Whenever Borborygmos and Fblthp enters or attacks, draw a card, then you may discard any number of land cards. ${WHEN_TEXT}`;
const LIBRARY_TEXT = "{1}{U}: Put Borborygmos and Fblthp into its owner's library third from the top.";

const DRAW_AND_DISCARD: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "discard", target: "you", amount: 0, anyNumber: true, filter: { type: "land" } },
    {
      kind: "conditional",
      condition: { kind: "this-way", what: "discarded" },
      then: {
        kind: "reflexive-trigger",
        targets: ["creature"],
        value: { thisWay: "discarded" },
        effect: { kind: "damage", amount: { product: [2, { triggerValue: true }] }, target: 0 },
        text: WHEN_TEXT,
      },
    },
  ],
};

export default defineCard({
  name: "Borborygmos and Fblthp",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cyclops", "Homunculus"],
  power: 6,
  toughness: 5,
  text: `${TEXT}\n${LIBRARY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: DRAW_AND_DISCARD,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: DRAW_AND_DISCARD,
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: { fromTop: 3 } },
      resolve: null,
      text: LIBRARY_TEXT,
    },
  ],
});
