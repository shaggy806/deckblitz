import { defineCard } from "../define.js";

const PUMP = "Enchanted creature gets +1/+0 and has haste.";

export default defineCard({
  name: "Escape Velocity",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\nEscape—{1}{R}, Exile two other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], grantKeywords: ["haste"], text: PUMP }],
  escape: { cost: "{1}{R}", exileCount: 2 },
});
