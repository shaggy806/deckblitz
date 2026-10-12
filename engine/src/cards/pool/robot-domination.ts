import { defineCard } from "../define.js";

const GRAVE_TEXT =
  "Whenever one or more creature cards are put into your graveyard from anywhere, you draw a card, lose 1 life, and put a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the third plan counter is put on this enchantment, sacrifice it and create three 2/2 colorless Robot Villain artifact creature tokens.";

export default defineCard({
  name: "Robot Domination",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${GRAVE_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: GRAVE_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "create-token", token: "Robot Villain Token", count: 3 },
        ],
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
