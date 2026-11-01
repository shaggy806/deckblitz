import { defineCard } from "../define.js";

// EDHREC rank 5145.
export default defineCard({
  name: "Rhet-Tomb Mystic",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nEach creature card in your hand has cycling {1}{U}. ({1}{U}, Discard that card: Draw a card.)",
  static: [
    {
      affects: { scope: "self" },
      grantsCyclingInHand: { cost: "{1}{U}", filter: { type: "creature" } },
      text: "Each creature card in your hand has cycling {1}{U}.",
    },
  ],
});
