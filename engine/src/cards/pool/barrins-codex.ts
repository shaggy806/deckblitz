import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 23291.
//
// The count is the artifact's as it was sacrificed (last-known information,
// rule 608.2h — Time Bomb's shape). Adding the counter is optional, and a
// missed upkeep can't be made up later (the ruling).

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a page counter on this artifact.";
const DRAW_TEXT =
  "{4}, {T}, Sacrifice this artifact: Draw X cards, where X is the number of page counters on this artifact.";

export default defineCard({
  name: "Barrin's Codex",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${UPKEEP_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "page" } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a page counter on Barrin's Codex?",
        effect: { kind: "add-counter", target: "source", counter: "page", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
