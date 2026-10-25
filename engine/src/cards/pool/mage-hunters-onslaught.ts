import { defineCard } from "../define.js";

// EDHREC rank 23869.
// The second sentence is a delayed triggered ability for the rest of the
// turn (rule 603.7c): each creature that blocks, any controller's, costs its
// controller 1 life.
const DESTROY_TEXT = "Destroy target creature or planeswalker.";
const BLOCK_TEXT = "Whenever a creature blocks this turn, its controller loses 1 life.";

export default defineCard({
  name: "Mage Hunters' Onslaught",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${DESTROY_TEXT}\n${BLOCK_TEXT}`,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "blocks", who: "any", filter: { type: "creature" } } },
        effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
        text: BLOCK_TEXT,
      },
    ],
  },
});
