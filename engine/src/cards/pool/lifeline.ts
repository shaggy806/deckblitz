import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature dies, if another creature is on the battlefield, return the first card to the battlefield under its owner's control at the beginning of the next end step.";

// Urza's Saga. Every player's creatures (the errata dropped "your graveyard").
// The intervening-if (rule 603.4) is read after the death, so the creature that
// died isn't counted: when every creature dies at once, nothing comes back
// (the ruling). The return follows the card, so one gone from the graveyard by
// the end step stays where it is; each death sets up its own return.
export default defineCard({
  name: "Lifeline",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
          { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 },
        ],
      },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "put-onto-battlefield", target: "trigger-object" },
        text: "Return that card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
