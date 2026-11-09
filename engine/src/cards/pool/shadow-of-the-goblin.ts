import { defineCard } from "../define.js";

const VENGEANCE_TEXT =
  "Undying Vengeance — Whenever you play a land or cast a spell from anywhere other than your hand, this enchantment deals 1 damage to each opponent.";
const DEAL_ONE = { kind: "damage", amount: 1, who: "each-opponent" } as const;

export default defineCard({
  name: "Shadow of the Goblin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `Unreliable Visions — At the beginning of your first main phase, discard a card. If you do, draw a card.\n${VENGEANCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "Unreliable Visions — At the beginning of your first main phase, discard a card. If you do, draw a card.",
    },
    {
      trigger: { on: "plays-card", who: "you", filter: { type: "land", not: { enteredFrom: "hand" } } },
      targets: [],
      effect: DEAL_ONE,
      resolve: null,
      text: VENGEANCE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      sameAbilityAs: 1,
      targets: [],
      effect: DEAL_ONE,
      resolve: null,
      text: VENGEANCE_TEXT,
    },
  ],
});
