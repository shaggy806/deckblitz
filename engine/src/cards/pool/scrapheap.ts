import { defineCard } from "../define.js";

// EDHREC rank 12293.

const TEXT = "Whenever an artifact or enchantment is put into your graveyard from the battlefield, you gain 1 life.";

export default defineCard({
  name: "Scrapheap",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { typesAnyOf: ["artifact", "enchantment"], ownedBy: "you" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
