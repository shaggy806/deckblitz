import { defineCard } from "../define.js";

// EDHREC rank 14771.
//
// Rulings:
//   [2026-06-29] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2026-06-29] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2026-06-29] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2026-06-29] "Flashback [cost]" means "You may cast this card from your graveyard by paying
//     [cost] rather than paying its mana cost" and "If the flashback cost was paid, exile this
//     card instead of putting it anywhere else any time it would leave the stack."
//
// "Cast from a graveyard" is the spell's `castFrom` (Nibelheim Aflame's shape):
// flashback, or any other permission to cast it from a graveyard.

export default defineCard({
  name: "Plunder the Trollshaws",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{3}{U}" },
  text: "Draw a card. If this spell was cast from a graveyard, draw two cards instead.\nFlashback {3}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castFrom: "graveyard" } },
    then: { kind: "draw", amount: 2 },
    else: { kind: "draw", amount: 1 },
  },
});
