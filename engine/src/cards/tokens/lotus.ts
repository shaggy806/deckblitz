import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

/**
 * Kwia Vigorbloom's token — "a colorless artifact token named Lotus with
 * '{T}, Sacrifice this token: Add three mana of any one color.'" A named token
 * whose name collides with no card, so it's keyed by that name (Karox
 * Bladewing's shape). `any-color` with an amount of 3 is three mana of one
 * colour, never a mix (Gilded Lotus, Lotus Bloom).
 */
export default defineCard({
  name: "Lotus",
  art: "c59b7223-00a9-4c0d-896d-1cd463860c40",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice this token: Add three mana of any one color.",
  activated: [
    addManaAbility({
      mana: "any-color",
      amount: 3,
      sacrifice: "self",
      text: "{T}, Sacrifice this token: Add three mana of any one color.",
    }),
  ],
});
