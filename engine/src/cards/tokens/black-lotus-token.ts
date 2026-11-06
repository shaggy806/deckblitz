import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

/** The Black Lotus token (Arzakon): a copy of the card Black Lotus — named
 * Black Lotus, its {0} mana cost and all. */
const TAP = "{T}, Sacrifice this token: Add three mana of any one color.";

export default defineCard({
  name: "Black Lotus Token",
  tokenName: "Black Lotus",
  art: "bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: `${TAP}\n(This token's mana cost is {0}.)`,
  activated: [addManaAbility({ mana: "any-color", amount: 3, sacrifice: "self", text: TAP })],
});
