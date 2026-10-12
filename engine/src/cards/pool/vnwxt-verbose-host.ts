import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 3312. At max speed each card drawn becomes two — every one of
// a "draw three" (the rulings), and with another such effect each doubles
// the other's draws too (`Game.drawCountFor`).
const HAND_TEXT = "You have no maximum hand size.";
const DRAW_TEXT = "If you would draw a card, draw two cards instead.";

export default defineCard({
  name: "Vnwxt, Verbose Host",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 0,
  toughness: 4,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${HAND_TEXT}\nMax speed — ${DRAW_TEXT}`,
  static: [
    { affects: { scope: "self" }, noMaxHandSize: true, text: HAND_TEXT },
    maxSpeed({
      replacement: { event: "would-draw", who: "you", instead: { draws: 2 } },
      text: `Max speed — ${DRAW_TEXT}`,
    }),
  ],
});
