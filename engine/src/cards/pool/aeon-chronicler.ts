import { defineCard } from "../define.js";

const CDA_TEXT = "Aeon Chronicler's power and toughness are each equal to the number of cards in your hand.";
const DRAW_TEXT = "Whenever a time counter is removed from this card while it's exiled, draw a card.";

export default defineCard({
  name: "Aeon Chronicler",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: `${CDA_TEXT}\nSuspend X—{X}{3}{U}. X can't be 0.\n${DRAW_TEXT}`,
  suspend: { n: "x", cost: "{X}{3}{U}" },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time" },
      whileSuspended: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
