import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 12371. Gift of Paradise's grant, with an investigate in place
// of its life gain.

const INVESTIGATE_TEXT =
  "When this Aura enters, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const GRANT_TEXT = 'Enchanted land has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "Weirding Wood",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${INVESTIGATE_TEXT}\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "When this Aura enters, investigate.",
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
