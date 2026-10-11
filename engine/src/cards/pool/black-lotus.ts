import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Banned in Commander; in the pool for casual play. "Three mana of any one
// color" is `any-color` × 3 (Gilded Lotus, Lotus Bloom).

export default defineCard({
  name: "Black Lotus",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice this artifact: Add three mana of any one color.",
  activated: [
    addManaAbility({
      mana: "any-color",
      amount: 3,
      sacrifice: "self",
      text: "{T}, Sacrifice this artifact: Add three mana of any one color.",
    }),
  ],
});
