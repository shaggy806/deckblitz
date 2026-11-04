import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

const ENTER_TEXT = "When this Case enters, create a 2/1 black Skeleton creature token and suspect it.";
const SOLVE_TEXT = "To solve — You control no suspected Skeletons. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — {1}{B}, Sacrifice this Case: Search your library for a card, put it into your hand, then shuffle. Activate only as a sorcery.";

// "It" is the token this made (`thisWay: "created"`), every one a replacement
// added included, and no older one.
export default defineCard({
  name: "Case of the Stashed Skeleton",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT} (It has menace and can't block.)\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "2/1 Black Skeleton Token", count: 1 },
          { kind: "for-each-permanent", filter: { thisWay: "created" }, effect: { kind: "suspect", target: 0 } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve({ kind: "not", of: { kind: "controls", filter: { subtype: "Skeleton", suspected: true }, atLeast: 1 } }, SOLVE_TEXT),
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      condition: { kind: "solved" },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
