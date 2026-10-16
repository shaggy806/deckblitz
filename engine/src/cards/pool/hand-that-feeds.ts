import { defineCard } from "../define.js";

// EDHREC rank 24082. "Whenever this creature attacks while …" is a trigger
// condition (`whileCondition`, rule 603.1), not an intervening "if": delirium
// is asked as it attacks, never again as the ability resolves — Quilled
// Charger's "while saddled" shape.
const ATTACK_TEXT =
  "Delirium — Whenever this creature attacks while there are four or more card types among cards in your graveyard, it gets +2/+0 and gains menace until end of turn.";

export default defineCard({
  name: "Hand That Feeds",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mutant"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "delirium" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
