import { defineCard } from "../define.js";

// EDHREC rank 8437.

export default defineCard({
  name: "Terra Eternal",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "All lands have indestructible.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      grantKeywords: ["indestructible"],
      text: "All lands have indestructible.",
    },
  ],
});
