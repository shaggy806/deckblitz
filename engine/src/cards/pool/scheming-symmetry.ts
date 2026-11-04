import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Core Set 2020. Two different players (rule 115.3 reads "two target" as two
// targets, none twice), you among them if you like. They search in APNAP order
// however they were targeted (rule 101.4, `for-each-target`), and one left the
// game is skipped while the other still searches. "A card" names only a
// quantity, so each must find one while the library has any (rule 701.23d); the
// find goes on top after the shuffle (`"library-top"`).

const TEXT = "Choose two target players. Each of them searches their library for a card, then shuffles and puts that card on top.";

export default defineCard({
  name: "Scheming Symmetry",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: distinctTargets(2, "player"),
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "search-library",
      who: { controllerOfTarget: 0 },
      filter: {},
      destination: "library-top",
      min: 1,
      max: 1,
    },
  },
});
