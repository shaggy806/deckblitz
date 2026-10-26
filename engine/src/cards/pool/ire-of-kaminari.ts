import { defineCard } from "../define.js";

// EDHREC rank 24501.

export default defineCard({
  name: "Ire of Kaminari",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Ire of Kaminari deals damage to any target equal to the number of Arcane cards in your graveyard.",
  targets: ["any-target"],
  // Counted as it resolves, while Ire itself is still on the stack (not yet in the graveyard).
  effect: { kind: "damage", target: 0, amount: { countInGraveyard: { subtype: "Arcane", ownedBy: "you" } } },
});
