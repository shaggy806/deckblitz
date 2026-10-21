import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 23678.
//
// A white Aura granting protection from blue: "this effect doesn't remove this
// Aura" never has anything to do (a white Aura isn't blue), so the static is a
// plain protection grant (Unquestioned Authority's shape).
const TEXT = "Enchanted creature has protection from blue. This effect doesn't remove this Aura.";

export default defineCard({
  name: "Blue Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, protection: { colors: ["U"] }, text: TEXT }],
});
