import { defineCard } from "../define.js";

// EDHREC rank 10253. Secrets of Strixhaven Commander.
//
// An intervening "if" (rule 603.4): checked as each end step begins — every
// player's — and again on resolution; nothing leaving the graveyard during
// the end step can make it trigger (the ruling).
const TEXT =
  "At the beginning of each end step, if a card left your graveyard this turn, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Relic Retriever",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit", "Monkey"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "cards-left-graveyard", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
