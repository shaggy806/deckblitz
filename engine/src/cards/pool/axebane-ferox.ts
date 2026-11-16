import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 10764.
// Ward (rule 702.21a) whose cost is collect evidence 4 (701.59a): the
// targeting player may exile cards with total mana value 4 or more from
// their graveyard, chosen as they pay, or the spell or ability is countered.
// With too little in their graveyard they can't pay it at all (701.59b).
//
// Rulings:
//   [2024-02-02] If you can't exile enough cards to meet or exceed the required mana value, you
//     can't choose to collect evidence at all.

export default defineCard({
  name: "Axebane Ferox",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch", "haste"],
  text: "Deathtouch, haste\nWard—Collect evidence 4. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player exiles cards with total mana value 4 or greater from their graveyard.)",
  triggered: [ward({ collectEvidence: 4 })],
});
