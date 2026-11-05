import { defineCard } from "../define.js";

// EDHREC rank 23889.

export default defineCard({
  name: "Flooded Woodlands",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: "Green creatures can't attack unless their controller sacrifices a land of their choice for each green creature they control that's attacking. (This cost is paid as attackers are declared.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"] } },
      combatTax: {
        on: ["attack"],
        permanents: { do: "sacrifice", filter: { type: "land" }, noun: "land" },
      },
      text: "Green creatures can't attack unless their controller sacrifices a land of their choice for each green creature they control that's attacking.",
    },
  ],
});
