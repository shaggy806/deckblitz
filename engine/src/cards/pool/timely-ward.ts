import { defineCard } from "../define.js";

const GRANT_TEXT = "Enchanted creature has indestructible.";

// "As though it had flash if it targets a commander" (`flashIf` with
// `targets`): the Aura's enchant target is the spell's target (rule 303.4a),
// any player's commander (rule 903.3).
export default defineCard({
  name: "Timely Ward",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashIf: { targets: { isCommander: true } },
  text: `You may cast this spell as though it had flash if it targets a commander.\nEnchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["indestructible"], text: GRANT_TEXT }],
});
