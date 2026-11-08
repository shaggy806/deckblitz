import { defineCard } from "../define.js";

const TEXT = "Whenever you proliferate, each opponent loses 2 life and you gain 2 life.";

// The generic `proliferates` trigger (B278).
export default defineCard({
  name: "Scheming Aspirant",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Advisor"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "proliferates", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
