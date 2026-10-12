import { defineCard } from "../define.js";

// EDHREC rank 6970.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2025-09-19] You must follow all normal timing rules when casting a spell with mayhem. For
//     example, you can't cast a creature card with mayhem you couldn't normally cast during an
//     opponent's turn, even if you discard that card during an opponent's turn.
//   [2025-09-19] Mayhem represents an alternative cost that can be paid to cast a spell from your
//     graveyard if you discarded the card with mayhem that turn. You must pay any additional costs
//     the spell has.

export default defineCard({
  name: "Ultimate Green Goblin",
  manaCost: "{1}{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Villain"],
  power: 5,
  toughness: 4,
  mayhem: { cost: "{2}{B/R}" },
  text: "At the beginning of your upkeep, discard a card, then create a Treasure token.\nMayhem {2}{B/R} (You may cast this card from your graveyard for {2}{B/R} if you discarded it this turn. Timing rules still apply.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // The Treasure comes whether or not a card was discarded.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, discard a card, then create a Treasure token.",
    },
  ],
});
