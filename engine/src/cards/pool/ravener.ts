import { defineCard } from "../define.js";
import { ravenous } from "../helpers.js";

// EDHREC rank 10280.
//
// Ravenous is the `ravenous()` helper (Exocrine). "Attacks target opponent
// this turn if able" is obeyed only by attacking that player (Dulcet Sirens'
// `attack-requirement`).
const RAVENOUS = ravenous();
const ENTER_TEXT = "When this creature enters, target creature attacks target opponent this turn if able.";

export default defineCard({
  name: "Ravener",
  manaCost: "{X}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 0,
  toughness: 0,
  keywords: ["flash"],
  text: `Flash\nRavenous (This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters.)\n${ENTER_TEXT}`,
  static: [RAVENOUS.static],
  triggered: [
    RAVENOUS.triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature", "opponent"],
      effect: { kind: "attack-requirement", target: 0, attacks: 1, duration: "this-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
