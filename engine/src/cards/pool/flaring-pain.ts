import { defineCard } from "../define.js";

// EDHREC rank 18165.
//
// Rulings:
//   [2004-10-04] Spells and abilities that replace or redirect damage are not affected by this
//     card.
//   [2004-10-04] The "damage can't be prevented" statement overrides all forms of preventing
//     damage. Damage prevention spells and abilities can still be cast and activated, they just
//     don't do anything.
//   [2021-03-19] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2021-03-19] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2021-03-19] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2021-03-19] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//   [2021-03-19] "Flashback [cost]" means "You may cast this card from your graveyard by paying
//     [cost] rather than paying its mana cost" and "If the flashback cost was paid, exile this
//     card instead of putting it anywhere else any time it would leave the stack."
//   [2021-03-19] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.

export default defineCard({
  name: "Flaring Pain",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  flashback: { cost: "{R}" },
  text: "Damage can't be prevented this turn.\nFlashback {R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "damage-cant-be-prevented" },
});
