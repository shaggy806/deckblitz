import { defineCard } from "../define.js";

// EDHREC rank 12131.

const TAP_TEXT = "Whenever Tui and La become tapped, draw a card.";
const UNTAP_TEXT = "Whenever Tui and La become untapped, put a +1/+1 counter on them.";

export default defineCard({
  name: "Tui and La, Moon and Ocean",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fish", "Spirit"],
  power: 3,
  toughness: 3,
  text: `${TAP_TEXT}\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "event", event: "becomes-untapped", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
