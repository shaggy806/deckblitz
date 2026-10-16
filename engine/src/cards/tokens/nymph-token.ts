import { defineCard } from "../define.js";

// A 2/2 white Nymph enchantment creature — Psemilla, Meletian Poet's token.
export default defineCard({
  name: "Nymph Token",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 2,
});
