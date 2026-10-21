import { defineCard } from "../define.js";

// EDHREC rank 28614.

const TEXT =
  "Whenever this creature attacks or blocks, if you control a Vraska planeswalker, target opponent loses 2 life and you gain 2 life.";
const VRASKA = { kind: "controls", filter: { type: "planeswalker", subtype: "Vraska" }, atLeast: 1 } as const;
const DRAIN = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: 2, target: 0 },
    { kind: "gain-life", amount: 2 },
  ],
} as const;

export default defineCard({
  name: "Vraska's Conquistador",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: VRASKA,
      targets: ["opponent"],
      effect: DRAIN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      condition: VRASKA,
      targets: ["opponent"],
      effect: DRAIN,
      resolve: null,
      text: TEXT,
    },
  ],
});
