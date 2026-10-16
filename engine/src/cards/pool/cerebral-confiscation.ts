import { defineCard } from "../define.js";

const DISCARD_TWO = "Target opponent discards two cards.";
const CHOOSE_ONE = "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.";

export default defineCard({
  name: "Cerebral Confiscation",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DISCARD_TWO}\n• ${CHOOSE_ONE}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DISCARD_TWO,
        targets: ["opponent"],
        effect: { kind: "discard", target: 0, amount: 2 },
      },
      {
        text: CHOOSE_ONE,
        targets: ["opponent"],
        effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      },
    ],
  },
});
