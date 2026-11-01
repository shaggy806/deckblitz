import { defineCard } from "../define.js";

const TEXT = "Each player can't cast more than one spell each turn.";

export default defineCard({
  name: "Rule of Law",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, prohibits: { who: "each-player", spells: true, castLimit: 1 }, text: TEXT }],
});
