import { defineCard } from "../define.js";

const DAMAGE_TEXT = "Whenever you're dealt damage, you may put that many charge counters on this artifact.";
const DRAW_TEXT = "{2}, {T}, Remove four charge counters from this artifact: You gain 2 life and draw a card.";

export default defineCard({
  name: "Angelheart Vial",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${DAMAGE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put that many charge counters on Angelheart Vial?",
        effect: { kind: "add-counter", target: "source", counter: "charge", amount: { triggerValue: true } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 4 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
