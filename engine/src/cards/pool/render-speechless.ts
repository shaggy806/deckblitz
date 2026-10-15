import { defineCard } from "../define.js";

// EDHREC rank 20936.
const DISCARD_TEXT =
  "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.";
const COUNTERS_TEXT = "Put two +1/+1 counters on up to one target creature.";

export default defineCard({
  name: "Render Speechless",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: `${DISCARD_TEXT}\n${COUNTERS_TEXT}`,
  targets: ["opponent", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 2 },
    ],
  },
});
