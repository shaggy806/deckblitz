import { defineCard } from "../define.js";

// EDHREC rank 28105. Amonkhet. Base power and toughness set in layer 7b, so
// counters and +N/+N effects still apply on top, whenever they began (the
// rulings); a later setting effect overwrites it by timestamp.

const STATIC_TEXT = "Enchanted creature has base power and toughness 0/2.";

export default defineCard({
  name: "Illusory Wrappings",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, setBasePt: { power: 0, toughness: 2 }, text: STATIC_TEXT }],
});
