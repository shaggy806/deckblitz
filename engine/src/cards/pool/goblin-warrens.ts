import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 15734.
//
// Rulings:
//   [2004-10-04] The token Goblins can be sacrificed to the Warrens to generate new Goblins.
const TEXT = "{2}{R}, Sacrifice two Goblins: Create three 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "Goblin Warrens",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: { filter: { subtype: "Goblin" }, count: 2 } },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
