import { defineCard } from "../define.js";

// Banned in Commander; in the pool for casual play.
//
// Rulings:
//   [2025-10-02] If an opponent controls an artifact that's also an enchantment, that permanent is
//     counted only once for Dockside Extortionist's ability.
//
// One count of permanents of either type (`typesAnyOf`), so an artifact
// enchantment is one permanent, counted once; read as the trigger resolves.

const ETB_TEXT =
  "When this creature enters, create X Treasure tokens, where X is the number of artifacts and enchantments your opponents control.";

export default defineCard({
  name: "Dockside Extortionist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 1,
  toughness: 2,
  text: `${ETB_TEXT} (Treasure tokens are artifacts with "{T}, Sacrifice this token: Add one mana of any color.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { countOf: { typesAnyOf: ["artifact", "enchantment"], controlledBy: "opponent" } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
