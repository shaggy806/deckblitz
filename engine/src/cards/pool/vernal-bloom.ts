import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 10931. Gauntlet of Might's shape: a triggered
// mana ability (rule 605.1b — the ruling) on any Forest, whoever controls it,
// and the {G} goes to the player who tapped it, its controller.
const TEXT = "Whenever a Forest is tapped for mana, its controller adds an additional {G}.";

export default defineCard({
  name: "Vernal Bloom",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { subtype: "Forest" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
