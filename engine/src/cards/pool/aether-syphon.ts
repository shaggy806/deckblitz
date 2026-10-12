import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 8583. The max speed ability is a triggered one the artifact
// has only while its controller's speed is 4 (rule 702.178a): a draw before
// then doesn't trigger it.
const DRAW_TEXT = "{2}, {T}: Draw a card.";
const MILL_TEXT = "Whenever you draw a card, each opponent mills two cards.";

export default defineCard({
  name: "Aether Syphon",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["artifact"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${DRAW_TEXT}\nMax speed — ${MILL_TEXT} (Each opponent puts the top two cards of their library into their graveyard.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [
    maxSpeed({
      grantsTriggered: [
        {
          trigger: { on: "draws", who: "you" },
          targets: [],
          effect: { kind: "mill", target: "each-opponent", amount: 2 },
          resolve: null,
          text: MILL_TEXT,
        },
      ],
      text: `Max speed — ${MILL_TEXT}`,
    }),
  ],
});
