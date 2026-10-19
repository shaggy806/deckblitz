import { defineCard } from "../define.js";

// EDHREC rank 25302. An intervening "if" (rule 603.4): checked as it triggers
// and again as it resolves.
const TEXT =
  "Whenever this creature attacks, if there are three or more creature cards in your graveyard, draw a card.";

export default defineCard({
  name: "Gaea's Courser",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Soldier"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
