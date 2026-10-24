import { defineCard } from "../define.js";

// EDHREC rank 7815.
// The second sentence is a delayed triggered ability lasting until its
// controller's next turn (rule 603.7c), firing each time any creature
// becomes tapped (attacking, a cost, an effect). A creature entering the
// battlefield tapped never becomes tapped, so it's spared (the ruling).
const DESTROY_TEXT = "Destroy all tapped creatures.";
const WATCH_TEXT = "Until your next turn, whenever a creature becomes tapped, destroy it.";

export default defineCard({
  name: "Don't Move",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${DESTROY_TEXT} ${WATCH_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", tapped: true } },
      {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "becomes-tapped", who: "any", filter: { type: "creature" } },
          until: "your-next-turn",
        },
        effect: { kind: "destroy", target: "trigger-object" },
        text: "Whenever a creature becomes tapped, destroy it.",
      },
    ],
  },
});
