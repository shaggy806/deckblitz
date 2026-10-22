import { defineCard } from "../define.js";

// EDHREC rank 18320. "Enters or attacks" is one ability with two trigger
// events (`sameAbilityAs`).

const ENERGY = "Whenever this creature enters or attacks, you get {E} (an energy counter).";
const UPKEEP = "At the beginning of your upkeep, you may pay {E}{E}. If you do, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Glint-Sleeve Siphoner",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${ENERGY}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ENERGY,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ENERGY,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to draw a card and lose 1 life?",
        costEnergy: 2,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
