import { defineCard } from "../define.js";

// EDHREC rank 22262. Ruling: the trigger destroys Serenity itself too.

const TEXT = "At the beginning of your upkeep, destroy all artifacts and enchantments. They can't be regenerated.";

export default defineCard({
  name: "Serenity",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { typesAnyOf: ["artifact", "enchantment"] },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
