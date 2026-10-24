import { defineCard } from "../define.js";

// EDHREC rank 27001.
//
// Rulings:
//   Nissa's Encouragement can't be used to find a card with the land type Forest that isn't
//     also named Forest (such as Sheltered Thicket from the Amonkhet set).
//   You can find any or all of the cards listed with Nissa's Encouragement. You could even find
//     none, but that wouldn't be very encouraging.
//
// One find per name (Krosan Verge's `together.oneEach`) over the library and
// the graveyard: the library is a hidden zone, so the search may find none of
// them (rule 701.23b), even one waiting in the graveyard.
const NAMES = ["Forest", "Brambleweft Behemoth", "Nissa, Genesis Mage"] as const;

export default defineCard({
  name: "Nissa's Encouragement",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library and graveyard for a card named Forest, a card named Brambleweft Behemoth, and a card named Nissa, Genesis Mage. Reveal those cards, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { anyOf: NAMES.map((name) => ({ name })) },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 3,
    zones: "library-and-graveyard",
    together: { oneEach: NAMES.map((name) => ({ label: `a card named ${name}`, filter: { name } })) },
  },
});
