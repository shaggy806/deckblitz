import { defineCard } from "../define.js";

// EDHREC rank 16815.

const TEXT = "Prevent all noncombat damage that would be dealt to creatures you control.";

export default defineCard({
  name: "Mark of Asylum",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
