import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 11234. Sarkhan, the Dragonspeaker's two
// emblem-like lines, printed on a creature.
const DRAW_TEXT = "At the beginning of your draw step, draw an additional card.";
const DISCARD_TEXT = "At the beginning of your end step, discard your hand.";

export default defineCard({
  name: "Avaricious Dragon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DRAW_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "discard-hand", who: "you" },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
