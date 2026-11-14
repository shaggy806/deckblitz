import { defineCard } from "../define.js";

// The quest counter is an intervening "if" (rule 603.4), checked at the end
// step's start and again as it resolves. With six or more counters, each draw
// is asked about as it would happen (rule 616.1): draw it, or search instead —
// the card searched for isn't drawn (rule 614.11), and a search from an empty
// library still replaces the draw, so it isn't a loss.
const TRIGGER =
  "At the beginning of each end step, if you drew two or more cards this turn, you may put a quest counter on this enchantment.";
const STATIC =
  "As long as this enchantment has six or more quest counters on it, if you would draw a card, you may instead search your library for a card, put that card into your hand, then shuffle.";

export default defineCard({
  name: "Archmage Ascension",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TRIGGER}\n${STATIC}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Archmage Ascension?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 6 } },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          text: "search your library for a card, put that card into your hand, then shuffle",
          effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
        },
        may: true,
      },
      text: STATIC,
    },
  ],
});
