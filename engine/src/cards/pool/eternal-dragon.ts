import { defineCard } from "../define.js";

// EDHREC rank 11906.
//
// Rulings:
//   [2009-02-01] Plainscycling is a form of cycling: it searches for any card with the Plains
//     land type (nonbasic included), and you may choose not to find one.

export default defineCard({
  name: "Eternal Dragon",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: "Flying\n{3}{W}{W}: Return this card from your graveyard to your hand. Activate only during your upkeep.\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: "{3}{W}{W}: Return this card from your graveyard to your hand. Activate only during your upkeep.",
    },
  ],
});
