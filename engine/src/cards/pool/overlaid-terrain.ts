import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const AS_ENTERS = "As this enchantment enters, sacrifice all lands you control.";
const GRANT = 'Lands you control have "{T}: Add two mana of any one color."';

// The lands go right before it enters, so they never have its ability (its
// ruling).
export default defineCard({
  name: "Overlaid Terrain",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${AS_ENTERS}\n${GRANT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", instead: { sacrifice: { filter: { type: "land" }, count: "all" } } },
      text: AS_ENTERS,
    },
    {
      affects: { scope: "lands-you-control" },
      grantsActivated: [addManaAbility({ mana: "any-color", amount: 2, text: "{T}: Add two mana of any one color." })],
      text: GRANT,
    },
  ],
});
