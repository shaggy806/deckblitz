import { defineCard } from "../define.js";

const STATIC = "Lands don't untap during their controllers' untap steps.";
const UPKEEP = "At the beginning of each player's upkeep, that player untaps a land they control.";

export default defineCard({
  name: "Rising Waters",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${STATIC}\n${UPKEEP}`,
  static: [{ affects: { scope: "filter", filter: { type: "land" } }, restrictions: ["doesnt-untap"], text: STATIC }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "untap", target: 0 },
        prompt: "Untap a land you control",
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
