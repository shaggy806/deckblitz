import { defineCard } from "../define.js";

// EDHREC rank 9708. Gixian Puppeteer's second-card drain, for 1.
const ATTACK_TEXT =
  "Whenever Kang attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)";
const DRAW_TEXT = "Whenever you draw your second card each turn, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Kang, Temporal Tyrant",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
