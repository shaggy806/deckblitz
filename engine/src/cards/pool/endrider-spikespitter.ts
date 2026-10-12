import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 18636. Count on Luck's impulse draw, had only at max speed:
// the card is played paying its costs and following the usual timing (the
// ruling).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Endrider Spikespitter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 4,
  keywords: ["reach", "start-your-engines"],
  text: `Reach\n${START_YOUR_ENGINES_TEXT}\nMax speed — ${UPKEEP_TEXT}`,
  static: [
    maxSpeed({
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: `Max speed — ${UPKEEP_TEXT}`,
    }),
  ],
});
