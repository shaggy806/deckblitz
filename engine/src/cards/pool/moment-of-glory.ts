import { defineCard } from "../define.js";

// EDHREC rank 19481.
//
// Rulings:
//   [2026-06-29] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2026-06-29] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2026-06-29] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2026-06-29] "Flashback [cost]" means "You may cast this card from your graveyard by paying
//     [cost] rather than paying its mana cost" and "If the flashback cost was paid, exile this
//     card instead of putting it anywhere else any time it would leave the stack."

export default defineCard({
  name: "Moment of Glory",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{4}{W}" },
  text: "Put a +1/+1 counter on target creature you control. If this spell was cast from a graveyard, also put a +1/+1 counter on each other creature you control.\nFlashback {4}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature-you-control"],
  // "Each other creature": every creature you control but the target (`exceptTarget`).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "graveyard" } },
        then: {
          kind: "add-counter-all",
          filter: { type: "creature", controlledBy: "you" },
          counter: "+1/+1",
          amount: 1,
          exceptTarget: 0,
        },
      },
    ],
  },
});
