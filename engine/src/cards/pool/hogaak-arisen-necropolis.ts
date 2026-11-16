import { defineCard } from "../define.js";

// EDHREC rank 11008.
//
// Rulings (in brief):
//   Delve and convoke aren't alternative costs: they pay the total cost (any increase
//   included) once it's determined, and don't change the mana value.
//   Delve exiles only for generic mana, at most one card per generic.
//   A multicolored creature convoking pays {1} or one mana of any of its colors.
//   Any untapped creature you control can convoke, summoning sick or attacking.
//
// - "You can't spend mana to cast this spell": `cantSpendManaToCast` — what
//   convoke and delve leave unpaid can't be paid, so they pay it all: a black
//   or green creature for each {B/G}, cards from the graveyard (never itself,
//   on the stack by then) or creatures for the {5}.
// - "You may cast this card from your graveyard": `mayPlaySelf`.
export default defineCard({
  name: "Hogaak, Arisen Necropolis",
  manaCost: "{5}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  convoke: true,
  delve: true,
  cantSpendManaToCast: true,
  mayPlaySelf: { from: ["graveyard"] },
  text:
    "You can't spend mana to cast this spell.\n" +
    "Convoke, delve (Each creature you tap while casting this spell pays for {1} or one mana of that creature's color. Each card you exile from your graveyard pays for {1}.)\n" +
    "You may cast this card from your graveyard.\n" +
    "Trample",
});
