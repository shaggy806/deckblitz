import { defineCard } from "../define.js";

// EDHREC rank 7106.
//
// The upkeep payment is Mana Vault's `may` with a `cost`: offered only when
// {2} can be paid, and the draw and life loss only if it was.
const ENTER_TEXT = "When Eye of Vecna enters, you draw a card and you lose 2 life.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you may pay {2}. If you do, you draw a card and you lose 2 life.";

const drawAndLose = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "lose-life", amount: 2 },
  ],
} as const;

export default defineCard({
  name: "Eye of Vecna",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: drawAndLose,
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {2} to draw a card and lose 2 life?", cost: "{2}", effect: drawAndLose },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
