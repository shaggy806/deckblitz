import { defineCard } from "../define.js";

// EDHREC rank 30137. Ravnica: City of Guilds.
//
// Rulings:
//   [2005-10-01] You may activate the second ability in response to activating the first one. If
//     you do, you’ll remove the blood counter that was just added before you lose the life.
//
// The life lost reads the counters as the first ability resolves, so a
// counter removed in response is gone from the count.

const DRAW_TEXT =
  "{2}, {T}, Put a blood counter on this artifact: Draw a card, then you lose 1 life for each blood counter on this artifact.";
const REMOVE_TEXT = "{U}{B}: Remove a blood counter from this artifact.";

export default defineCard({
  name: "Bloodletter Quill",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW_TEXT}\n${REMOVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, addCounter: { kind: "blood", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: { countersOn: "source", counter: "blood" } },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      cost: { mana: "{U}{B}", tap: false },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "blood", amount: 1 },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
});
