import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

const GRANT_TEXT = 'Enchanted land has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "Sheltered Aerie",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [addManaAbility({ mana: "any-color", amount: 2, text: "{T}: Add two mana of any one color." })],
      text: GRANT_TEXT,
    },
  ],
});
