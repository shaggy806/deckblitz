import { defineCard } from "../define.js";

// EDHREC rank 17927.

export default defineCard({
  name: "Meishin, the Mind Cage",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "All creatures get -X/-0, where X is the number of cards in your hand.",
  static: [
    {
      affects: { scope: "all-creatures" },
      grantPtPerCount: { cardsInHand: true, pt: [-1, 0] },
      text: "All creatures get -X/-0, where X is the number of cards in your hand.",
    },
  ],
});
