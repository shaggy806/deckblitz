import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// Star Trek Commander (TRC). The count is fixed by the reveal; the counters
// going on before or after the draws changes nothing a player can see.

const TEXT =
  "Parley — At the beginning of combat on your turn, each player reveals the top card of their library, then draws a card. For each nonland card revealed this way, put a +1/+1 counter on Ambassador K'Ehleyr.";

export default defineCard({
  name: "Ambassador K'Ehleyr",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Human", "Advisor"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: parley({ kind: "add-counter", target: "source", counter: "+1/+1", amount: PARLEY_NONLAND }),
      resolve: null,
      text: TEXT,
    },
  ],
});
