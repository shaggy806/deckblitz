import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 6839.
//
// Rulings:
//   [2020-11-10] If the target land is an illegal target by the time Gift of Paradise tries to
//     resolve, it doesn't resolve. It won't enter the battlefield, so its enters-the-battlefield
//     ability won't trigger.
//
// Abundant Growth's shape. "Two mana of any one color" is `any-color` with
// `amount: 2` (Gilded Lotus) — one colour, never a mix.
const GAIN_TEXT = "When this Aura enters, you gain 3 life.";
const GRANT_TEXT = 'Enchanted land has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "Gift of Paradise",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GAIN_TEXT}\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [addManaAbility({ mana: "any-color", amount: 2, text: "{T}: Add two mana of any one color." })],
      text: GRANT_TEXT,
    },
  ],
});
