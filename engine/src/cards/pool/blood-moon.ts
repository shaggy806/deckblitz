import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Moon",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Nonbasic lands are Mountains.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } },
      setSubtypes: ["Mountain"],
      text: "Nonbasic lands are Mountains.",
    },
  ],
});
