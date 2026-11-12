import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect): four new Fblthp cards you own, into your library, then shuffled.
// Solved, it's Radha, Heart of Keld's top-of-library permission for lands and
// spells alike, which lets you look at that card any time.
const ENTER_TEXT =
  "When this Case enters, conjure four cards named Fblthp, the Lost into your library, then shuffle. Draw a card.";
const SOLVE_TEXT = "To solve — You control a legendary Homunculus. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — You may look at the top card of your library any time and you may play lands and cast spells from the top of your library.";

export default defineCard({
  name: "Case of the Lost Witness",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "conjure", name: "Fblthp, the Lost", to: "library", count: 4 },
          { kind: "shuffle-library" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve(
      { kind: "controls", filter: { supertype: "legendary", subtype: "Homunculus" }, atLeast: 1 },
      SOLVE_TEXT,
    ),
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "solved" },
      mayPlay: { from: "library-top", play: true },
      text: SOLVED_TEXT,
    },
  ],
});
