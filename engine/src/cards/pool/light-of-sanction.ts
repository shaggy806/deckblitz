import { defineCard } from "../define.js";

export default defineCard({
  name: "Light of Sanction",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Prevent all damage that would be dealt to creatures you control by sources you control.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
        source: { controlledBy: "you" },
      },
      text: "Prevent all damage that would be dealt to creatures you control by sources you control.",
    },
  ],
});
