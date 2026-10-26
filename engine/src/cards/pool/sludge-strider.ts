import { defineCard } from "../define.js";

// Conflux (CON).
//
// One ability with two trigger events (`sameAbilityAs`): another artifact you
// control entering, or leaving. The player is targeted as it triggers; {1} is
// paid as it resolves (Kalastria Highborn's shape).

const TEXT =
  "Whenever another artifact you control enters or leaves the battlefield, you may pay {1}. If you do, target player loses 1 life and you gain 1 life.";
const DRAIN = {
  kind: "may",
  prompt: "Pay {1}: target player loses 1 life and you gain 1 life?",
  cost: "{1}",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 1, target: 0 },
      { kind: "gain-life", amount: 1, who: "you" },
    ],
  },
} as const;

export default defineCard({
  name: "Sludge Strider",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      targets: ["player"],
      effect: DRAIN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      sameAbilityAs: 0,
      targets: ["player"],
      effect: DRAIN,
      resolve: null,
      text: TEXT,
    },
  ],
});
