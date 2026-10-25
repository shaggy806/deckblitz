import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 30280.
//
// Rulings:
//   [2014-02-01] You must return an enchantment you control to its owner’s hand during each combat
//     in which you attack with Floodtide Serpent.

export default defineCard({
  name: "Floodtide Serpent",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 4,
  text: "This creature can't attack unless you return an enchantment you control to its owner's hand. (This cost is paid as attackers are declared.)",
  // TODO(scaffold): This creature can't attack unless you return an enchantment you control to its owner's hand.
});
