import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 21100.
//
// Rulings:
//   In multi-player games it affects all opponents.
//   Gives one life for each and every Forest tapped.
//
// Once per Forest, for any tapping — for mana, a cost or an effect.
const TEXT = "Whenever a Forest an opponent controls becomes tapped, you gain 1 life.";

export default defineCard({
  name: "Lifetap",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { subtype: "Forest", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
