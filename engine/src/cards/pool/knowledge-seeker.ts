import { defineCard } from "../define.js";

// EDHREC rank 15841. Atlantean Cavalry's second-card trigger: it counts every
// card drawn this turn, Knowledge Seeker there or not, and fires only on the
// second (the rulings).
const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Knowledge Seeker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fox", "Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${DRAW_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a Clue token.",
    },
  ],
});
