import { defineCard } from "../define.js";

// EDHREC rank 3477.
//
// Rulings:
//   [2025-06-06] Blitzball's last ability doesn't care who controls the legendary creature that
//     dealt combat damage to an opponent this turn.

export default defineCard({
  name: "Blitzball",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.\nGOOOOAAAALLL! — {T}, Sacrifice this artifact: Draw two cards. Activate only if an opponent was dealt combat damage by a legendary creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      // Whoever controlled the legendary creature (the ruling).
      condition: {
        kind: "turn-history",
        what: "combat-damaged-by",
        who: "opponent",
        filter: { type: "creature", supertype: "legendary" },
      },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "GOOOOAAAALLL! — {T}, Sacrifice this artifact: Draw two cards. Activate only if an opponent was dealt combat damage by a legendary creature this turn.",
    },
  ],

});
