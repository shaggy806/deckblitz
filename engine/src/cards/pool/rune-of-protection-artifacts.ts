import { defineCard } from "../define.js";

// EDHREC rank 27247.
//
// Rulings:
//   [2004-10-04] A source of damage is a permanent, a spell on the stack (including one that
//     creates a permanent), or any object referred to by an object on the stack. A source doesn't
//     need to be capable of dealing damage to be a legal choice.
//   [2004-10-04] Can be used even when there is no damage to prevent. It prevents the next damage
//     (if any) from the source this turn.

export default defineCard({
  name: "Rune of Protection: Artifacts",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  cycling: { cost: "{2}" },
  text: "{W}: The next time an artifact source of your choice would deal damage to you this turn, prevent that damage.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { type: "artifact" },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: "{W}: The next time an artifact source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
