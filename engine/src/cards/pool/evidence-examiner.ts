import { defineCard } from "../define.js";

// EDHREC rank 25441.
// Makes Clue → use "Clue Token".

export default defineCard({
  name: "Evidence Examiner",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Detective"],
  power: 2,
  toughness: 2,
  text: "At the beginning of combat on your turn, you may collect evidence 4. (Exile cards with total mana value 4 or greater from your graveyard.)\nWhenever you collect evidence, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "collect-evidence", amount: 4 },
      resolve: null,
      text: "At the beginning of combat on your turn, you may collect evidence 4.",
    },
    {
      trigger: { on: "evidence-collected", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever you collect evidence, investigate.",
    },
  ],
});
