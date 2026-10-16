import { defineCard } from "../define.js";

// EDHREC rank 14638.
//
// A graveyard ability (rule 113.6k — Dogged Detective's shape): it triggers
// only while the card is in your graveyard, on the third card you draw in a
// turn (cards drawn before it got there count), and it isn't optional.
const RETURN_TEXT =
  "When you draw your third card in a turn, return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Sneaky Snacker",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "draws", who: "you", nthEachTurn: 3 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
