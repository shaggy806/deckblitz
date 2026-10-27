import { defineCard } from "../define.js";

// EDHREC rank 22130.
//
// Rulings:
//   [2004-12-01] You do the scrying at the end of the ability's resolution (assuming you pay {1}).

export default defineCard({
  name: "Eyes of the Watcher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever you cast an instant or sorcery spell, you may pay {1}. If you do, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to scry 2?",
        cost: "{1}",
        effect: { kind: "scry", amount: 2 },
      },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, you may pay {1}. If you do, scry 2.",
    },
  ],
});
