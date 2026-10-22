import { defineCard } from "../define.js";

// EDHREC rank 19768.
//
// Rulings:
//   [2017-07-14] Its first ability applies only while it's on the battlefield.
//   [2017-07-14] It counts only the cards with cycling abilities in your graveyard, whether or
//     not they were cycled to get there.
//   [2017-07-14] Variants of cycling, such as basic landcycling or Wizardcycling, count
//     (`hasCycling` includes typecycling — rule 702.29e).

export default defineCard({
  name: "Vile Manifestation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 4,
  cycling: { cost: "{2}" },
  text: "This creature gets +1/+0 for each card with cycling in your graveyard.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { hasCycling: true, ownedBy: "you" }, pt: [1, 0] },
      text: "This creature gets +1/+0 for each card with cycling in your graveyard.",
    },
  ],
});
