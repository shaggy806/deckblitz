import { defineCard } from "../define.js";

// EDHREC rank 9256.
//
// Rulings:
//   [2015-11-04] Casting Scourge of Nel Toth from your graveyard by paying the alternative cost
//     doesn’t change when you can cast it. You can cast it only at the normal time you could cast
//     a creature spell.
//   [2015-11-04] If you cast Scourge of Nel Toth from your graveyard, it is a spell and can be
//     countered.
//   [2015-11-04] As soon as you start to cast Scourge of Nel Toth from your graveyard, it moves to
//     the stack. At that point, it’s too late for an opponent to prevent you from casting it by
//     removing it from your graveyard. It’s also too late for players to try to destroy the
//     creatures you sacrifice to pay for the spell.

export default defineCard({
  name: "Scourge of Nel Toth",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nYou may cast this creature from your graveyard by paying {B}{B} and sacrificing two creatures rather than paying its mana cost.",
  // The card's own permission from its graveyard (rule 113.6f), an
  // alternative cost (118.9): {B}{B} and two creatures, which ones chosen as
  // the cost is paid (601.2h). Its timing is a creature spell's (the ruling).
  mayPlaySelf: { from: ["graveyard"], byPaying: "{B}{B}", sacrifice: { type: "creature" }, sacrificeCount: 2 },
});
