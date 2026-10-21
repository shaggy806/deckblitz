import { defineCard } from "../define.js";

// EDHREC rank 28826.

const TEXT =
  "Whenever an artifact you control is put into a graveyard from the battlefield, you may pay {1}. If you do, you gain 1 life.";

export default defineCard({
  name: "Tablet of Epityr",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to gain 1 life?",
        cost: "{1}",
        effect: { kind: "gain-life", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
