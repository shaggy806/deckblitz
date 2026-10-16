import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 23556.
//
// Djeru and Hazoret's hand-size condition on a self static. Gaining menace
// after it's been blocked doesn't undo the block (the ruling) — menace is
// only checked as blockers are declared.

const ENTER_TEXT =
  "When this creature enters, discard your hand, then investigate four times. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const HAND_TEXT = "As long as you have one or fewer cards in hand, this creature gets +2/+2 and has menace.";

export default defineCard({
  name: "Carnage Interpreter",
  manaCost: "{1}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Devil", "Detective"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${HAND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 1 },
      grantPt: [2, 2],
      grantKeywords: ["menace"],
      text: HAND_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "discard-hand", who: "you" }, investigate(4)] },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
