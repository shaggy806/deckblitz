import { defineCard } from "../define.js";

export default defineCard({
  name: "Ivory Mask",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "You have shroud. (You can't be the target of spells or abilities.)",
  static: [{ affects: { scope: "self" }, playerKeywords: ["shroud"], text: "You have shroud. (You can't be the target of spells or abilities.)" }],
});
