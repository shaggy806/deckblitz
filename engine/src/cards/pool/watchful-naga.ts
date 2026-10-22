import { defineCard } from "../define.js";

// EDHREC rank 26309. Amonkhet. Glorybringer's exert, its "when you do" a draw.

const EXERT_TEXT = "You may exert this creature as it attacks. When you do, draw a card.";

export default defineCard({
  name: "Watchful Naga",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
