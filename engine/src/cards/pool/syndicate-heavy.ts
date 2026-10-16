import { defineCard } from "../define.js";
import { extort, investigate } from "../helpers.js";

// EDHREC rank 19498.
//
// Angelic Accord's end-step trigger: an intervening "if" (rule 603.4) on the
// life you gained this turn, wherever this creature was as you gained it (the
// ruling), whatever life you lost besides. Investigates once however far past
// 4 you went.

const END_TEXT =
  "At the beginning of each end step, if you gained 4 or more life this turn, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Syndicate Heavy",
  manaCost: "{2}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Giant", "Rogue"],
  power: 4,
  toughness: 4,
  text: `Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)\n${END_TEXT}`,
  triggered: [
    extort(),
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 4 },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: END_TEXT,
    },
  ],
});
