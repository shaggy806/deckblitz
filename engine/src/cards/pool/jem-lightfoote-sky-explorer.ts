import { defineCard } from "../define.js";

// EDHREC rank 21135. The intervening "if" (rule 603.4, the ruling): no spell
// cast from your hand this turn, asked as the end step begins and again as
// it resolves — each spell read as it was cast (`castFrom`).
const END_TEXT =
  "At the beginning of your end step, if you haven't cast a spell from your hand this turn, draw a card.";

export default defineCard({
  name: "Jem Lightfoote, Sky Explorer",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "cast-this-turn", filter: { castFrom: "hand" }, atLeast: 0, atMost: 0 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
