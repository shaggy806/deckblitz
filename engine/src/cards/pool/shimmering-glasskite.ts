import { defineCard } from "../define.js";

// Betrayers of Kamigawa. The first time each turn any spell or ability targets
// it (anyone's, this battlefield stint), that spell or ability is countered —
// ward's counter with nothing to pay (rule 701.6a). A spell that can't be
// countered resolves anyway.

const TRIGGER_TEXT =
  "Whenever this creature becomes the target of a spell or ability for the first time each turn, counter that spell or ability.";

export default defineCard({
  name: "Shimmering Glasskite",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "ward", cost: null },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
