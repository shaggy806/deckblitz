import { defineCard } from "../define.js";

// EDHREC rank 6998.
//
// Rulings:
//   [2025-10-02] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//   [2025-10-02] "Flashback [cost]" means "You may cast this card from your graveyard by paying
//     [cost] rather than paying its mana cost" and "If the flashback cost was paid, exile this
//     card instead of putting it anywhere else any time it would leave the stack."
//   [2025-10-02] If the exiled card has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.
//   [2025-10-02] If you cast a card "without paying its mana cost," you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs. If the card has any
//     mandatory additional costs, such as sacrificing a creature, those must be paid to cast the
//     card.
//   [2025-10-02] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2025-10-02] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2025-10-02] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2025-10-02] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-10-02] If you wish to cast the exiled card without paying its mana cost, you must cast
//     it while Solstice Revelations is resolving. You can't cast it that way later in the turn. A
//     spell cast this way may be cast at a time you normally wouldn't be able to cast a spell of
//     that type, but other restrictions (such as "Cast this spell only during combat") are
//     enforced.

export default defineCard({
  name: "Solstice Revelations",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Lesson"],
  flashback: { cost: "{6}{R}" },
  text: "Exile cards from the top of your library until you exile a nonland card. You may cast that card without paying its mana cost if the spell's mana value is less than the number of Mountains you control. If you don't cast that card this way, put it into your hand.\nFlashback {6}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  // As Breaching Dragonstorm: the card found is cast for free while this
  // resolves, only if that spell's mana value is less than the Mountains
  // you control (read as it resolves); otherwise it goes to your hand.
  effect: {
    kind: "reveal-until",
    filter: { notTypes: ["land"] },
    exile: true,
    rest: "stay",
    then: {
      kind: "cast-now",
      target: 0,
      free: true,
      spell: {
        manaValue: {
          op: "lt",
          n: { amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
        },
      },
      else: { kind: "return-to-hand", target: 0, from: "exile" },
    },
  },
});
