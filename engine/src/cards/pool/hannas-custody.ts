import { defineCard } from "../define.js";

// EDHREC rank 22350.

export default defineCard({
  name: "Hanna's Custody",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "All artifacts have shroud. (They can't be the targets of spells or abilities.)",
  static: [
    {
      // Every player's artifacts.
      affects: { scope: "filter", filter: { type: "artifact" } },
      grantKeywords: ["shroud"],
      text: "All artifacts have shroud.",
    },
  ],
});
