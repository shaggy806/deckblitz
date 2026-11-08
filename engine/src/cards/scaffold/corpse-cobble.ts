import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 19756.
// Makes Zombie → new token "Zombie Token (Corpse Cobble)" (scaffolded).
//
// Rulings:
//   [2021-09-24] You may choose to sacrifice no creatures to pay the additional cost. If you do,
//     you'll create a 0/0 Zombie token. Unless something else is raising its toughness, the token
//     will subsequently die, but any "enters the battlefield" or "dies" triggered abilities will
//     still trigger.
//   [2021-09-24] If you cast Corpse Cobble using flashback, you still pay its additional cost of
//     sacrificing any number of creatures.
//   [2025-06-06] "Flashback [cost]" means "You may cast this card from your graveyard if the
//     resulting spell is an instant or sorcery spell by paying [cost] rather than paying its mana
//     cost" and "If the flashback cost was paid, exile this card instead of putting it anywhere
//     else any time it would leave the stack."
//   [2025-06-06] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2025-06-06] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2025-06-06] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//   [2025-06-06] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-06-06] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.

export default defineCard({
  name: "Corpse Cobble",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  flashback: { cost: "{3}{U}{B}" },
  text: "As an additional cost to cast this spell, sacrifice any number of creatures.\nCreate an X/X blue and black Zombie creature token with menace, where X is the total power of the sacrificed creatures.\nFlashback {3}{U}{B} (You may cast this card from your graveyard for its flashback cost and any additional costs. Then exile it.)",
  // TODO(scaffold): As an additional cost to cast ~, sacrifice any number of creatures.
  // TODO(scaffold): Create an X/X blue and black Zombie creature token with menace, where X is the total power of the sacrificed creatures.
});
