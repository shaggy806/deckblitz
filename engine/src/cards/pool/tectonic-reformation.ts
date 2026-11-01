import { defineCard } from "../define.js";

// EDHREC rank 6720.
export default defineCard({
  name: "Tectonic Reformation",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Each land card in your hand has cycling {R}.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  cycling: { cost: "{2}" },
  static: [
    {
      affects: { scope: "self" },
      grantsCyclingInHand: { cost: "{R}", filter: { type: "land" } },
      text: "Each land card in your hand has cycling {R}.",
    },
  ],
});
