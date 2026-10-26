import { defineCard } from "../define.js";

// EDHREC rank 14391.
//
// Rulings:
//   [2004-10-04] Buyback causes a spell to go to your hand instead of your graveyard, so using
//     Buyback will avoid triggering this card to be sacrificed.
//   [2004-10-04] Discarding does trigger this.
//
// "A card": a token put into the graveyard is no card (rule 111.1), and the
// `put-into-graveyard` trigger never sees one.

export default defineCard({
  name: "Energy Field",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Prevent all damage that would be dealt to you by sources you don't control.\nWhen a card is put into your graveyard from anywhere, sacrifice this enchantment.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "you", source: { controlledBy: "opponent" } },
      text: "Prevent all damage that would be dealt to you by sources you don't control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When a card is put into your graveyard from anywhere, sacrifice this enchantment.",
    },
  ],
});
