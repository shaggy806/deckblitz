import { defineCard } from "../define.js";

export default defineCard({
  name: "True Believer",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "You have shroud. (You can't be the target of spells or abilities.)",
  static: [{ affects: { scope: "self" }, playerKeywords: ["shroud"], text: "You have shroud. (You can't be the target of spells or abilities.)" }],
});
